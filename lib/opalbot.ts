/**
 * The core behavior for the OPAL bot.
 */

import * as util from 'util';
import { SlackBot, Message } from '../multibot/slackbot';
import { TerminalBot } from '../multibot/termbot';
import { Bot, Conversation } from '../multibot/basebot';
import { Wit } from 'node-wit';
import * as wit from './wit';

import fetch from 'node-fetch';

import { findURL, gitSummary } from './util';
import * as calendar from './calendar';

/**
 * Our data model for keeping track of users' data.
 */
interface User {
  slack_id: string;
  calendar_url?: string;
}

/**
 * Get some events from a calendar as a string.
 */
async function someEvents(cal: calendar.Calendar) {
  // Get the bounds of the current week.
  let [start, end] = calendar.thisWeek();

  // Get events in the range.
  let out = "";
  for (let [event, time] of calendar.getOccurrences(cal, start, end)) {
    let details = event.getOccurrenceDetails(time);
    out += details.startDate.toString() + " " + event.summary + "\n";
  }
  return out.trim();
}

/**
 * The main logic for the Opal bot.
 */
export class OpalBot {
  /**
   * User settings, stored in the database.
   */
  public users: LokiCollection<User>;

  /**
   * Cached copies of the users' calendars, indexed by URL.
   */
  public calendars: Map<String, calendar.Calendar> = new Map();

  constructor(
    public wit: Wit,
    public db: Loki,
  ) {
    // Get or create a database collection for users.
    this.users = (db.getCollection("users") ||
      db.addCollection("users")) as LokiCollection<User>;
  }

  /**
   * Connect the bot to a Slack team.
   */
  connectSlack(token: string, statusChan: string) {
    let slack = new SlackBot(token);

    // Handle Slack connection.
    slack.on("ready", async () => {
      console.log(`I'm ${slack.self.name} on ${slack.team.name}`);
      let status_channel = slack.channel(statusChan);
      if (status_channel) {
        let commit = await gitSummary(__dirname);
        slack.send(`:wave: @ ${commit}`, status_channel.id);
      }
    });

    this.register(slack);
    slack.start();
  }

  /**
   * Run the bot in terminal (debugging) mode.
   */
  runTerminal() {
    let term = new TerminalBot();
    this.register(term);
    term.run();
  }

  /**
   * Register this bot's callbacks with a connection.
   */
  register(bot: Bot) {
    bot.onConverse(async (text, conv) => {
      await this.interact(text, conv);
    });
  }

  /**
   * Get a user from the database, or create it if it doesn't exist.
   */
  getUser(conv: Conversation): User {
    let slack_id = conv.user;  // Currently assuming all users on Slack.
    let user = this.users.findOne({ slack_id }) as User;
    if (user) {
      return user;
    } else {
      let newUser = { slack_id };
      this.users.insert(newUser);
      this.db.saveDatabase();
      return newUser;
    }
  }

  /**
   * Interact with the user to get their calendar URL. If the user doesn't
   * have a URL yet, or if `force` is specified, ask them for one.
   */
  async getCalendarURL(conv: Conversation,
                       force = false): Promise<string | null> {
    // Do we already have a calendar URL for this user?
    let user = this.getUser(conv);
    if (!force && user.calendar_url) {
      return user.calendar_url;
    }

    // Query the user.
    conv.send("please paste your calendar URL");
    let url = findURL(await conv.recv());
    if (url) {
      console.log(`setting calendar URL to ${url}`);
      user.calendar_url = url;
      this.users.update(user);
      this.db.saveDatabase();
      return url;
    } else {
      conv.send("hmm... that doesn't look like a URL");
      return null;
    }
  }

  /**
   * Get the calendar data for a calendar URL, either from the cache or from
   * the network. `force` always downloads the data.
   */
  async getCalendarData(url: string, force = false) {
    // TODO This should invalidate the cache after a timeout.
    let cal = this.calendars.get(url);
    if (cal && !force) {
      return cal;
    } else {
      let resp = await fetch(url);
      if (!resp.ok) {
        throw `could not get calendar data (error ${resp.status})`;
      }
      let cal = calendar.parse(await resp.text());
      this.calendars.set(url, cal);
      return cal;
    }
  }

  /**
   * Conversation with a greeting intent.
   */
  async handle_greeting(conv: Conversation) {
    conv.send("hi!");
  }

  /**
   * Conversation where the user says goodbye.
   */
  async handle_bye(conv: Conversation) {
    conv.send(":wave: I'll be right here");
  }

  /**
   * Conversation where the user says thanks.
   */
  async handle_thanks(conv: Conversation) {
    conv.send("nbd yo");
  }

  /**
   * Conversation where the user wants to see their calendar.
   */
  async handle_show_calendar(conv: Conversation) {
    conv.send("let's get your calendar!");
    let url = await this.getCalendarURL(conv);
    if (url) {
      let cal;
      try {
        cal = await this.getCalendarData(url);
      } catch (e) {
        console.error(e);
        conv.send(`:flushed: ${e}`);
        return;
      }
      let agenda = await someEvents(cal);
      conv.send(agenda);
    }
  }

  /**
   * Conversation where the user wants to schedule a meeting.
   */
  async handle_schedule_meeting(conv: Conversation) {
    conv.send("let's get to schedulin'! " +
              "[actually this is not quite implemented yet]");
  }

  /**
   * Conversation where the user wants to set up their calendar settings.
   */
  async handle_setup_calendar(conv: Conversation) {
    let url = await this.getCalendarURL(conv, true);
    if (url) {
      conv.send("ok, we're all set!");
    }
  }

  /**
   * Conversation where the user asks for help using the bot.
   */
  async handle_help(conv: Conversation) {
    conv.send("I can schedule a meeting or show your calendar");
  }

  /**
   * Called when a conversation has a missing or unrecognized intent.
   */
  async handle_default(conv: Conversation) {
    conv.send(':confused: :grey_question:');
  }

  /**
   * Handle a new conversation by dispatching based on intent.
   */
  async interact(text: string, conv: Conversation) {
    let res = await this.wit.message(text, {});
    console.log(`Wit parse: ${util.inspect(res, { depth: undefined })}`);

    let unhandled = false;
    if (wit.getEntity(res, "greetings")) {
      await this.handle_greeting(conv);
    } else if (wit.getEntity(res, "bye")) {
      await this.handle_bye(conv);
    } else if (wit.getEntity(res, "thanks")) {
      await this.handle_thanks(conv);
    } else {
      let intent = wit.entityValue(res, "intent");
      if (intent === "show_calendar") {
        await this.handle_show_calendar(conv);
      } else if (intent === "schedule_meeting") {
        await this.handle_schedule_meeting(conv);
      } else if (intent === "setup_calendar") {
        await this.handle_setup_calendar(conv);
      } else if (intent === "help") {
        await this.handle_help(conv);
      } else {
        await this.handle_default(conv);
      }
    }
  }
}
