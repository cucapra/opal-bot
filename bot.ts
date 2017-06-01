import * as child_process from 'child_process';
import { Wit } from 'node-wit';
import * as util from 'util';
import * as path from 'path';
import fetch from 'node-fetch';
import * as ical from 'ical.js';
import * as Loki from 'lokijs';

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

      // Do we already have a calendar URL for this user?
      let user = getUser(message.user);
      if (user.calendar_url) {
        let url = user.calendar_url;
        bot.send(`your calendar URL is ${url}`, chan);
      } else {
        bot.send("please paste your calendar URL", chan);
        let url = (await bot.wait(chan)).text;
        console.log(`getting calendar at ${url}`);
        /*
        let resp = await fetch(url);
        let jcal = ical.parse(await resp.text());
        console.log(jcal);
        */
        bot.send("thanks!", chan);
        user.calendar_url = url;
        users.update(user);
      }

      return;
    } else if (intent === "schedule_meeting") {
      bot.send("let's schedule a meeting!", chan);
      return;
    }
  }

  // Unhandled message.
  bot.send(':confused: :grey_question:', chan);
}

interface User {
  slack_id: string;
  calendar_url?: string;
}

/**
 * Get a user from the database, or create it if it doesn't exist.
 */
function getUser(slack_id: string): User {
  let user = users.findOne({ slack_id });
  if (user) {
    return user as User;
  } else {
    let newUser = { slack_id };
    users.insert(newUser);
    return newUser;
  }
}

const wit_client = new Wit({
  accessToken: WIT_TOKEN,
});

const bot = new Bot(BOT_TOKEN);

const db = new Loki(path.join(__dirname, DB_NAME));
const users = db.addCollection("users");

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
