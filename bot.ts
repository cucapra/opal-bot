
import { Wit } from 'node-wit';
import * as Loki from 'lokijs';

import { SlackBot } from './lib/slackbot';
import { OpalBot } from './lib/opalbot';

const BOT_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const WIT_TOKEN = process.env['WIT_ACCESS_TOKEN'] || '';
const STATUS_CHAN = 'bot-status';
const DB_NAME = 'store.json';

/**
 * Open a Loki database and load its contents.
 */
function openDB(filename: string): Promise<Loki> {
  return new Promise((resolve, reject) => {
    let db = new Loki(filename);
    db.loadDatabase({}, () => resolve(db));
  });
}

/**
 * Run the bot.
 */
async function main() {
  let bot = new OpalBot(
    new SlackBot(BOT_TOKEN),
    new Wit({ accessToken: WIT_TOKEN }),
    await openDB(DB_NAME),
    STATUS_CHAN,
  );
  bot.start();
}

main();
