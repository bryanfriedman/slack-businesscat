var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var WebClient = require('@slack/client').WebClient;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var jargon = require('../data/triggers.json');
var jargonRegExp = new RegExp(jargon.join('|'), 'gi');

var stats = require('./stats.js');

var token = process.env.SLACK_API_TOKEN || '';

var rtm = new RtmClient(token, {dataStore: new MemoryDataStore()});
var web = new WebClient(token);

function matchJargon(message) {
  function matches(obj) {
    return obj.text && obj.text.match(jargonRegExp);
  }
  return matches(message) || (message.attachments && message.attachments.some(matches));
}

function run() {
  rtm.on(RTM_EVENTS.MESSAGE, function parseMessage(message) {
    var matches = matchJargon(message);
    if (matches) {
      web.reactions.add('businesscat', {
        channel: message.channel,
        timestamp: message.ts
      });
      matches.forEach(function (match) {
        stats.log(message.user, message.channel, match);
      });
    }
  });
  rtm.start();
}

module.exports = {
  run: run,
  rtm: rtm,
  web: web
};
