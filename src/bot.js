const Twit = require('twit')
const fs = require('fs-extra')
const csvparse = require('csv-parse')
const rita = require('rita')

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

function introToMarkovChains() {
  // Make A Bot That Sounds Like You with RiTa.js
  const inputText = "I went to the car. The car went to the grocery store. Saif went bowling behind the store."

  // Markov chains are a way to generate text based on the probabilities of the words that came before.
  // n-grams, or the number of words that the model is going to take into consideration.
  // rita.RiMarkov(nGrams number) | rita.RiMarkov(3) three words consideration
  const markov = new rita.RiMarkov(3)
  markov.loadText(inputText)

  const sentences = markov.generateSentences(1);
  console.log(sentences)
  console.log(markov.getProbability('went'))
  // will post an object of words with the highest probabilities that should be the next word
  console.log(markov.getProbabilities('went'))
  // returns to { the: 1 } which means to is followed by 'the' 100% of the time
  console.log(markov.getProbabilities('to'))
  // returns { car: 0.3333333333333333, grocery: 0.3333333333333333, store: 0.3333333333333333 }
  // whichs means theres a 33% probability that either car, grocery or store will be the next word to be suggested
  // this is all on the vocabulary gathered from the inputText.
  console.log(markov.getProbabilities('the'))
}

const filePath = process.cwd() + '/twitter_archive/tweets.csv'
var inputText = "I went to the car. The car went to the grocery store. Saif went bowling behind the store."

function hasNoStopWords(token) {
  const stopWords = ['@', 'http', 'RT']

  // if any item returns false then the entire function returns false
  return stopWords.every((sw) => !token.includes(sw)) // if a sw is included in token return false
}

function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
    .filter(hasNoStopWords)
    .join(' ')
    .trim();
}

const tweetData = fs.createReadStream(filePath)
  .pipe(csvparse({ delimiter: ','}))
  .on('data', (row) => { inputText = inputText + ' ' + cleanText(row[5]) })
  .on('end', () => {
    const markov = new rita.RiMarkov(2)
    markov.loadText(inputText)
    const sentence = markov.generateSentences(4)
    bot.post('statuses/update', { status: sentence }, (err, data, response) => {
      if (err) console.log(err)
      else
        console.log('Status tweeted.')
    })
  })

