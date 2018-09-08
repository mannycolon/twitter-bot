const Twit = require('twit')
const request = require('request')
const fs = require('fs-extra')

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

// post a tweet 
function postTweet (status) {
  bot.post('statuses/update', { status: status}, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was tweeted.`)
  });
}

// interact with users

// followers ids
function getFollowersIds (screenName) {
  bot.get('followers/ids', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// list of users who follow us
function getListFollowers (screenName) {
  bot.get('followers/list', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    data.users.forEach(user => console.log(user.screen_name));// log screen names (usernames)
  });
}

// how to follow people
function followUser(screenName) {
  bot.post('friendships/create', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// lookup ids of people we follow
function listIdsForFollowedUsers (screenName) {
  bot.get('friends/ids', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// lookup list of people we follow
function listFollowedUsers (screenName) {
  bot.get('friends/list', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// get if we follow user and if they follow back (connections)
function getUserConnection (screenName) {
  bot.get('friendships/lookup', { screen_name: screenName }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// direct message 
function directMessageUser (screenName, text) {
  bot.post('direct_messages/new', { screen_name: screenName, text: text }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}
 
// see the tweets from people we follow (most recent 5)
function getBotTimeline () {
  bot.get('statuses/home_timeline', { count: 5 }, (err, data, response) => {
    if (err) console.log(err)
    data.forEach(d => {
      console.log(d.text)
      console.log(d.user.screen_name)
      console.log(d.id_str)
      console.log('\n')
    });
  })
}

// retweet
function retweet (tweetId) {
  bot.post('statuses/retweet/:id', { id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was retweeted.`)
  });
}

// unretweet
function unretweet (tweetId) {
  bot.post('statuses/unretweet/:id', { id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was unretweeted.`)
  });
}

// like a tweet
function likeTweet (tweetId) {
  bot.post('favorites/create', { id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was liked.`)
  });
}

// unlike a tweet
function unlikeTweet (tweetId) {
  bot.post('favorites/destroy', { id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was unliked.`)
  });
}

// reply to a tweet
function replyToTweet(replyMessage, inReplyToStatusId) {
  bot.post('statuses/update', { status: replyMessage, in_reply_to_status_id: inReplyToStatusId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(data)
  });
}

// delete a tweet
function deleteTweet (tweetId) {
  bot.post('statuses/destroy/:id', { id: tweetId }, (err, data, response) => {
    if (err) console.log(err)
    console.log(`${data.text} was deleted.`)
  });
}

// Twitter Search API
// query and count parameters to get the search term(s) and number of tweets that we want
// q: 'happy -birthday -anniversary' look up tweets with the string happy but without birthday.
// #hashtags :(, :)
// `to:@username` or `from:@username`
// 'red OR apple' one of two words
// 'blue fish'for two words or '"blue fish"' for exact phrase
// 'dance filter:safe' search dance but filter out any risky
// 'dance filter:media' with picture or video
// 'dance filter:vine' returns vines
// 'dance filter:images' images
// 'dance filter:links' with links/url
// 'dance url:amazon' amazon will be in the url
// 'dance ?' questions
// 'dance since:2017-01-01' add a date

function searchTweets (query, count) {
  bot.get('search/tweets', { q: query, count: count }, (err, data, response) => {
    if (err) console.log(err)
    data.statuses.forEach((s) => {
      console.log(s.text)
      console.log(s.user.screen_name)
      console.log('\n')
    })
  })
}

// can use result_type as parameter to search for 'recent' or 'popular' tweets
function searchTweetsByResultType (query, count, resultType) {
  bot.get('search/tweets', { q: query, result_type: resultType, count: count }, (err, data, response) => {
    if (err) console.log(err)
    data.statuses.forEach((s) => {
      console.log(s.text)
      console.log(s.user.screen_name)
      console.log('\n')
    })
  })
}

// geo_code parameter, which takes the format latitude, longitude, and then a radius in miles, which will look for tweets originating from that area.
// geoCode example '33.9735637,-83.380579,1mi'
function searchTweetsByGeoCode(query, count, geoCode) {
  bot.get('search/tweets', { q: query, geo_code: geoCode, count: count }, (err, data, response) => {
    if (err) console.log(err)
    data.statuses.forEach((s) => {
      console.log(s.text)
      console.log(s.user.screen_name)
      console.log('\n')
    })
  })
}

// lang parameter to lookup for tweets in a language other than english ex. 'es'
function searchTweetsByLanguage(query, count, lang) {
  bot.get('search/tweets', { q: query, count: count, lang: lang }, (err, data, response) => {
    if (err) console.log(err)
    data.statuses.forEach((s) => {
      console.log(s.text)
      console.log(s.user.screen_name)
      console.log('\n')
    })
  })
}

// Twitter Stream API real-time stream of tweets. 
// There are two ways to do this. 
// The first is a sampling of random public tweets from the last seven days. 

// Stream random sampling of tweets
function streamRandomSamplingOfTweets () {
  const stream = bot.stream('statuses/sample')

  stream.on('tweet', (tweet) => {
    console.log(tweet.text + '\n')
  })
}

// for more specific information you can pass a parameter
// for example track (keeps track of a specific string) 
// 'win', 'win, lose' (multiple words) 'win lose' both words 
// spaces act as the logical AND (&&) and comas as the logical OR (||)

function streamTweetsOfSpecificString(stringToTrack) {
  const stream = bot.stream('statuses/filter', { track: stringToTrack })

  stream.on('tweet', (tweet) => {
    console.log(tweet.text + '\n')
  })
}

// filter by location
// two coordinates which represent a bounding box, with the first set of coordinates being the southwest corner.
// ex. locations: '-74,40,-73,41'
function streamByLocation(locations) {
  const stream = bot.stream('statuses/filter', { locations: locations })

  stream.on('tweet', (tweet) => {
    console.log(tweet.text + '\n')
  })
}

// filter by specific user
// follow: user id
function streamTweetsForUserId () {
  const stream = bot.stream('statuses/filter', { follow: '191100226'})

  stream.on('tweet', (tweet) => {
    console.log(tweet.text + '\n')
  })
}

// Tweet Media Files with Twit.js


function getNasaPhoto() {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY
    },
    encoding: 'binary'
  }

  request.get(parameters, (err, response, body) => {
    if (err) console.log(err)
    else
      body = JSON.parse(body)
      saveFile(body, 'nasa.jpg')
  })
}

function saveFile (body, filename) {
  const file = fs.createWriteStream(filename)

  request(body).pipe(file)
    .on('close', (err) => {
      if (err) console.log(err)
      else
        console.log('Media saved.\n')
        const description = body.title
        uploadMedia(description, filename)
    })
}

function uploadMedia(descriptionText, filename) {
  const filePath = process.cwd() + '/' + filename
  bot.postMediaChunked({ file_path: filePath }, (err, data, response) => {
    if (err) console.log(err)
    else
      console.log(data)
      // only used to actually post the media file to twitter
      postMediaToTwitter(descriptionText, data)
  })
}

function postMediaToTwitter(descriptionText, data) {
  const params = {
    status: descriptionText,
    media_ids: data.media_id_string
  }
  bot.post('statuses/update', params, (err, data, response) => {
    if (err) console.log(err)
    else
      console.log('Status (media) posted.')
  })
}

// uploads a video as well
// uploadMedia('video from NASA', 'nasa_video.mp4')
