import { Wit } from 'node-wit';
import * as Loki from 'lokijs';

import { OpalBot } from './lib/opalbot';

const SLACK_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
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
    new Wit({ accessToken: WIT_TOKEN }),
    await openDB(DB_NAME),
  );

  if (process.argv[2] === '-t') {
    bot.runTerminal();
  } else {
    bot.connectSlack(SLACK_TOKEN, STATUS_CHAN);
  }
}

main();
