import * as child_process from 'child_process';
import { Wit } from 'node-wit';
import * as util from 'util';
import * as path from 'path';
import fetch from 'node-fetch';
import * as ical from 'ical.js';
import * as Loki from 'lokijs';

const urlRegex: RegExp = require('url-regex')();

import { Bot, Message } from './lib/slackbot';
import * as wit from './lib/wit';
import * as cal from './lib/cal';

const BOT_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const WIT_TOKEN = process.env['WIT_ACCESS_TOKEN'] || '';
const STATUS_CHAN = 'bot-status';
const DB_NAME = 'store.json';

/**
 * Get the current git revision string for a repository.
 */
function git_summary(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec('git rev-parse --short HEAD', { cwd: path },
                       (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Extract a URL from a string, if any.
 */
function findURL(s: string): string | null {
  let matches = s.match(urlRegex);
  if (matches && matches.length) {
    let url = matches[0];
    // The regex is too dumb to remove trailing )s and >s.
    // https://github.com/kevva/url-regex/issues/34
    if (url.endsWith('>')) {
      url = url.slice(0, -1);
    }
    return url;
  } else {
    return null;
  }
}

interface User {
  slack_id: string;
  calendar_url?: string;
}

function openDB(): Promise<Loki> {
  return new Promise((resolve, reject) => {
    let db = new Loki(DB_NAME);
    db.loadDatabase({}, () => resolve(db));
  });
}

const wit_client = new Wit({
  accessToken: WIT_TOKEN,
});

const bot = new Bot(BOT_TOKEN);

async function main() {
  const db = await openDB();
  const users = db.getCollection("users") || db.addCollection("users");

  /**
   * Interact with the user to get their calendar URL. If the user doesn't
   * have a URL yet, or if `force` is specified, ask them for one.
   */
  async function getCalendarURL(userId: string,
                                chan: string,
                                force = false): Promise<string | null> {
    // Do we already have a calendar URL for this user?
    let user = getUser(userId);
    if (!force && user.calendar_url) {
      return user.calendar_url;
    }

    // Query the user.
    bot.send("please paste your calendar URL", chan);
    let url = findURL((await bot.wait(chan)).text);
    if (url) {
      console.log(`setting calendar URL to ${url}`);
      user.calendar_url = url;
      users.update(user);
      db.saveDatabase();
      return url;
    } else {
      bot.send("hmm... that doesn't look like a URL", chan);
      return null;
    }
  }

  /**
   * Handle a direct interaction.
   */
  async function interact(message: Message) {
    let text = message.text;
    let chan = message.channel;

    let res = await wit_client.message(text, {});
    console.log(`Wit parse: ${util.inspect(res, { depth: undefined })}`);

    if (wit.getEntity(res, "greetings")) {
      bot.send("hi!", chan);
      return;
    } else {
      let intent = wit.entityValue(res, "intent");
      if (intent === "show_calendar") {
        bot.send("let's get your calendar!", chan);
        let url = await getCalendarURL(message.user, chan);
        if (url) {
          bot.send(`your calendar URL is ${url}`, chan);
          /*
          let resp = await fetch(url);
          let jcal = ical.parse(await resp.text());
          console.log(jcal);
          */
        }
        return;
      } else if (intent === "schedule_meeting") {
        bot.send("let's schedule a meeting!", chan);
        return;
      } else if (intent === "setup_calendar") {
        let url = await getCalendarURL(message.user, chan, true);
        if (url) {
          bot.send("ok, we're all set!", chan);
        }
        return;
      } else if (intent === "help") {
        bot.send("I can schedule a meeting or show your calendar", chan);
        return;
      }
    }

    // Unhandled message.
    bot.send(':confused: :grey_question:', chan);
  }

  /**
   * Get a user from the database, or create it if it doesn't exist.
   */
  function getUser(slack_id: string): User {
    let user = users.findOne({ slack_id }) as User;
    if (user) {
      return user;
    } else {
      let newUser = { slack_id };
      users.insert(newUser);
      db.saveDatabase();
      return newUser;
    }
  }

  bot.on("ready", async () => {
    console.log(`I'm ${bot.self.name} on ${bot.team.name}`);

    // Indicate that we've started.
    let status_channel = bot.channel(STATUS_CHAN);
    if (status_channel) {
      let commit = await git_summary(__dirname);
      bot.send(`:wave: @ ${commit}`, status_channel.id);
    }
  });

  bot.onInit(async (message) => {
    // A new private message.
    console.log(`${message.user}: ${message.text}`);
    interact(message);
  });

  bot.start();
}

main();
