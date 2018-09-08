const Twit = require('twit')
const fs = require('fs-extra')
const request = require('request')
const vision = require('@google-cloud/vision')

const client = new vision.ImageAnnotatorClient({
  keyFilename: './keyfile.json'
})

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

const stream = bot.stream('statuses/filter', { track: '@fornixsystems' })

stream.on('connecting', function(response) {console.log('...connecting')})
stream.on('connected', () => console.log('connected!'))
stream.on('error', (err) => console.log(err))
stream.on('tweet', (tweet) => {
    if (tweet.entities.media) {
      downloadPhoto(tweet.entities.media[0].media_url, tweet.user.screen_name, tweet.id_str)
    }
  })

function downloadPhoto (url, replyToName, tweetId) {
  const parameters = {
    url: url,
    encoding: 'binary'
  }

  request.get(parameters, (err, response, body) => {
    const filename = 'photo' + Date.now() + '.jpg'
    fs.writeFile(filename, body, 'binary', (err) => {
      if (err) console.log(err)
      else
        console.log('Downloaded photo.')
        analyzePhoto(filename, replyToName, tweetId)
    })
  })
}

function analyzePhoto (filename, replyToName, tweetId) {
  const request = {
    image: {
      source: { filename: filename }
    }
  };

  client
    .faceDetection(request)
    .then(results => {
      const faces = results[0] ? results[0].faceAnnotations : [];
      const allEmotions = []

      faces.forEach(face => {
        extractFaceEmotions(face).forEach((emotion) => {
          if (allEmotions.indexOf(emotion) === -1) {
            allEmotions.push(emotion)
          }
        })
      });

      postStatus(allEmotions, replyToName, tweetId)
    })
    .catch(err => {
      console.error(err);
    });
}

// https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate#Likelihood
function extractFaceEmotions(face) {
  const emotions = ['joyLikelihood', 'angerLikelihood', 'sorrowLikelihood', 'surpriseLikelihood']

  return emotions.filter((emotion) => {
    return face[emotion] === 'VERY_LIKELY'
  })
}

function postStatus(allEmotions, replyToName, tweetId) {
  const status = formatStatus(allEmotions, replyToName)
  bot.post('statuses/update', { status: status, in_reply_to_status_id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    else console.log('Bot has tweeted ' + status)
  })
}

function formatStatus(allEmotions, replyToName) {
  const reformatEmotions = {
    joyLikelihood: 'happy',
    angerLikelihood: 'angry',
    sorrowLikelihood: 'sad',
    surpriseLikelihood: 'surprised'
  }
  var status = `@${replyToName} Looking `

  if (allEmotions.length > 0) {
    allEmotions.forEach((emotion, i) => {
      if (i === 0) {
        status = status + reformatEmotions[emotion]
      } else {
        status = status + ' and ' + reformatEmotions[emotion]
      }
    })
    status = status + '!'
  } else {
    status = status + 'neutral!'
  }

  return status
}