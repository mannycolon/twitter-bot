const Twit = require('twit')

const bot = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

function showAllDirectMessages() {
  bot.get('direct_messages/events/list', { count: 50 }, (err, data, response) => {
    if (err) console.log(err)
    else data.events.filter(event => event.type === 'message_create')
      .forEach(event => console.log(event));
  });
}

/**
 * Looks up users by ids
 * @param {*} userIds userIds = '1026198124480610304,1016497569885839360' OR 
 * userIds = '1026198124480610304' for only one user
 * Max number of events to be returned. 20 default. 50 max.
 */
function lookupUsersByIds(userIds) {
  bot.get('users/lookup', { user_id: userIds, count: 50 }, (err, data, response) => {
    if (err) console.log(err)
    else console.log(data)
  })
}

// showAllDirectMessages()
