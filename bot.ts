
import { Wit } from 'node-wit';
import fetch from 'node-fetch';
import * as ical from 'ical.js';
import * as Loki from 'lokijs';

import { SlackBot, Message } from './lib/slackbot';
import * as cal from './lib/cal';
import { gitSummary } from './lib/util';
import { OpalBot } from './lib/opalbot';

const BOT_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const WIT_TOKEN = process.env['WIT_ACCESS_TOKEN'] || '';
const STATUS_CHAN = 'bot-status';
const DB_NAME = 'store.json';

/**
 * Open a Loki database and load its contents.
 */
function openDB(): Promise<Loki> {
  return new Promise((resolve, reject) => {
    let db = new Loki(DB_NAME);
    db.loadDatabase({}, () => resolve(db));
  });
}

async function main() {
  // Set up wit.ai client.
  let wit_client = new Wit({
    accessToken: WIT_TOKEN,
  });

  // Set up Slack client.
  let slack = new SlackBot(BOT_TOKEN);

  slack.on("ready", async () => {
    console.log(`I'm ${slack.self.name} on ${slack.team.name}`);

    // Indicate that we've started.
    let status_channel = slack.channel(STATUS_CHAN);
    if (status_channel) {
      let commit = await gitSummary(__dirname);
      slack.send(`:wave: @ ${commit}`, status_channel.id);
    }
  });

  // Handle new messages.
  slack.onInit(async (message) => {
    // A new private message.
    console.log(`${message.user}: ${message.text}`);
    bot.interact(message);
  });

  // Set up database.
  let db = await openDB();

  // The main logic goes here.
  let bot = new OpalBot(slack, wit_client, db);

  // Connect to Slack.
  slack.start();
}

main();
