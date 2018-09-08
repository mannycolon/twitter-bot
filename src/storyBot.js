const Twit = require('twit')
const tracery = require('tracery-grammar')

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

const grammar = tracery.createGrammar({
  'character': ['Danny', 'Mark', 'Jhon', 'Aida'],
  'action': ['walk', 'stroll', 'meander'],
  'place': ['office', 'bank', 'court'],
  'object': ['letter', 'paper', 'bride'],
  'setPronouns': [
    '[they:they][them:them][their:their][theirs:theirs]',
    '[they:she][them:her][their:her][theirs:hers]',
    '[they:he][them:him][their:his][theirs:his]'
  ],
  'setJob': [
    '[job:lawyer][actions:argued in court,filed some paperwork]',
    '[job:inspector][actions:talked with the lawyer,conducted meetings]',
    '[job:officer][actions:arrested people,stood in the courtroom]'
  ], // will join two variables together
  'story': ['#protagonist# the #job# went to the #place# every day. Usually #they# #actions#. Then #they# picked up #their# #object#.'],
  'origin': ['#[#setPronouns#][#setJob#][protagonist:#character#]story#']
})
/**
 * Example of origin
 *   'origin': ['#character.capitalize# #action.ed# to the #place# for #object.a# or to get some #object.s#.']
 */

grammar.addModifiers(tracery.baseEngModifiers)

const story = grammar.flatten('#origin#')

console.log(story)


bot.post('statuses/update', { status: story }, (err, data, response) => {
  if (err) console.log(err)
  else console.log('Bot has Tweeted ' + story)
})