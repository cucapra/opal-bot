import { Wit } from 'node-wit';
import * as Loki from 'lokijs';

import { OpalBot } from './lib/opalbot';

const SLACK_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const WIT_TOKEN = process.env['WIT_ACCESS_TOKEN'] || '';
const FB_PAGE_TOKEN = process.env['FB_PAGE_TOKEN'] || '';
const FB_APP_SECRET = process.env['FB_APP_SECRET'] || '';
const FB_VERIFY_TOKEN = process.env['FB_VERIFY_TOKEN'] || '';
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
    new Wit({ accessToken: WIT_TOKEN }),
    await openDB(DB_NAME),
  );

  if (process.argv[2] === '-t') {
    bot.runTerminal();
  } else if (process.argv[2] == '-f') {
    bot.runFacebook(FB_PAGE_TOKEN, FB_APP_SECRET, FB_VERIFY_TOKEN, 4915);
  } else {
    bot.connectSlack(SLACK_TOKEN, STATUS_CHAN);
  }
}

main();
