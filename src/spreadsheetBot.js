const Twit = require('twit')
const Tabletop = require('tabletop')

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1tZrSRIHrvDUEcwvynatfWX4VgzvvLjASwAtSLqumylI/edit?usp=sharing'

Tabletop.init({
  key: spreadsheetUrl,
  callback: (data, tabletop) => {
    console.log(data)
    data.forEach(d => {
      bot.post('statuses/update', { status: d.URL + ' is a great API to use.' }, (err, response, data) => {
        if (err) console.log(err)
        else console.log('Posted!')
      })
    });
  },
  simpleSheet: true
})