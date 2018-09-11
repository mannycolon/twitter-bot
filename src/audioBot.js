/**
 * Audio Bot That Composes a Song Based on a Tweet
 */
const Twit = require('twit')
const rita = require('rita')
const midi = require('jsmidgen')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath.path)

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

const bot_username = '@fornixsystems'

const imgFn = path.join(process.cwd(), 'assets', 'black.jpg')
const midiFn = path.join(process.cwd(), 'assets', 'output.mid')
const wavFn = path.join(process.cwd(), 'assets', 'output.wav')
const vidFn = path.join(process.cwd(), 'assets', 'output.mp4')

// helper functions

function hasNoStopWords(token) {
  const stopWords = ['@', 'http', 'RT']

  // if any item returns false then the entire function returns false
  return stopWords.every((sw) => !token.includes(sw)) // if a sw is included in token return false
}

function isNotPuntuation(token) {
  return !rita.RiTa.isPunctuation(token);
}

function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
    .filter(hasNoStopWords)
    .join(' ')
    .trim();
}

function getPartsOfSpeech(text) {
  return rita.RiTa.getPosTags(text);
}

function compose(taggedTweet, track) {
  const notes = taggedTweet.map((tag) => {
    if (tag.includes('nn') || tag.includes('i')) { // nn is any kind of noun i is a pronoun
      return 'e4' // e is the note and 4 is the obtive
    }
    if (tag.includes('vb')) { // nn is any kind of noun
      return 'e4' // e is the note and 4 is the obtive
    }
    return 'c4'
  });

  notes.forEach(note => {
    track.addNote(0, note, 128) // channel, note string, duration. 128 = 1/4
  });
  return track;
}

function createMidi(tweet, midiFn, cb) {
  const file = new midi.File();
  const track = new midi.Track();
  file.addTrack(track)

  const cleanedText = rita.RiTa
    .tokenize(cleanText(tweet.text))
    .filter(isNotPuntuation)
    .join(' ')
  const taggedTweet = getPartsOfSpeech(cleanedText)
  compose(taggedTweet, track)
  fs.writeFile(midiFn, file.toBytes(), { encoding: 'binary' }, cb)
}

function convertMidiToWav(midiFn, wavFn, cb) {
  const command = `timidity --output-24bit -A120 ${midiFn} -Ow -o ${wavFn}`
  child_process.exec(command, {}, (err, stdout, stderr) => {
    if (err) cb(err)
    else {
      cb(null)
    }
  })
}

function convertVideo(imgFn, wavFn, vidFn, cb) {
  ffmpeg()
    .on('end', () => cb(null))
    .on('error', (err, stdout, stderr) => cb(err))
    .input(imgFn)
    .inputFPS(1/6)
    .input(wavFn)
    .output(vidFn)
    .outputFPS(30)
    .run()
}

function createMedia(tweet, imgFn, midiFn, wavFn, vidFn, cb) {
  createMidi(tweet, midiFn, (err, results) => {
    if (err) console.log(err)
    else {
      convertMidiToWav(midiFn, wavFn, err => {
        if (err) console.log(err)
        else {
          console.log('Midi converted!')
          convertVideo(imgFn, wavFn, vidFn, cb);
        }
      })
    }
  })
}

function deleteWav(wavFn, cb) {
  const command = `rm ${wavFn}`

  child_process.exec(command, {}, (err, stdout, stderr) => {
    if (err) cb(err)
    else cb(null)
  })
}

function postStatus(params) {
  bot.post('statuses/update', params, (err, data, response) => {
    if (err) console.log('Error posting status', err)
    else console.log('Bot has posted your status!')
  })
}

function uploadMedia(tweet, vidFn) {
  bot.postMediaChunked({ file_path: vidFn }, (err, data, response) => {
    if (err) {
      console.log('Error posting media chunk')
      console.log(err)
    } else {
      const stat = tweet.text.split(bot_username)
        .join(' ')
        .trim()
      const params = {
        status: `@${tweet.user.screen_name} ${stat}`,
        in_reply_to_status_id: tweet.id_str,
        media_ids: data.media_id_string
      }
      postStatus(params)
    }
  })
}

const stream = bot.stream('statuses/filter', { track: bot_username })
stream.on('connecting', (response) => console.log('...connecting'))
stream.on('connected', () => console.log('connected!'))
stream.on('error', (err) => console.log(err))
stream.on('tweet', (tweet) => {
  if (tweet.text.length > 0) {
    createMedia(tweet, imgFn, midiFn, wavFn, vidFn, (err) => {
      if (err) console.log(err)
      else {
        console.log('Media created!')
        deleteWav(wavFn, (err) => {
          if (err) {
            console.log('Error deleting wav file')
            console.log(err)
          }
          else uploadMedia(tweet, vidFn)
        })
      }
    })
  }
})
