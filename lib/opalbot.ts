/**
 * The core behavior for the OPAL bot.
 */

import * as util from 'util';
import { SlackBot, Message, Conversation } from './slackbot';
import { Wit } from 'node-wit';
import * as wit from './wit';

import { findURL, gitSummary } from './util';

/**
 * Our data model for keeping track of users' data.
 */
interface User {
  slack_id: string;
  calendar_url?: string;
}

/**
 * The main logic for the Opal bot.
 */
export class OpalBot {
  public users: LokiCollection<User>;

  constructor(
    public slack: SlackBot,
    public wit: Wit,
    public db: Loki,
    public statusChan: string,
  ) {
    // Get or create a database collection for users.
    this.users = (db.getCollection("users") ||
      db.addCollection("users")) as LokiCollection<User>;

    // Handle Slack connection.
    slack.on("ready", async () => {
      console.log(`I'm ${slack.self.name} on ${slack.team.name}`);
      this.ready();
    });

    // Handle new conversations.
    slack.onConverse(async (text, conv) => {
      await this.interact(text, conv);
    });
  }

  /**
   * Connect to Slack to bring up the bot.
   */
  start() {
    this.slack.start();
  }

  /**
   * Get a user from the database, or create it if it doesn't exist.
   */
  getUser(slack_id: string): User {
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
    let user = this.getUser(conv.userId);
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
   * Handle a new conversation by dispatching based on intent.
   */
  async interact(text: string, conv: Conversation) {
    let res = await this.wit.message(text, {});
    console.log(`Wit parse: ${util.inspect(res, { depth: undefined })}`);

    if (wit.getEntity(res, "greetings")) {
      conv.send("hi!");
      return;
    } else {
      let intent = wit.entityValue(res, "intent");
      if (intent === "show_calendar") {
        conv.send("let's get your calendar!");
        let url = await this.getCalendarURL(conv);
        if (url) {
          conv.send(`your calendar URL is ${url}`);
          /*
          let resp = await fetch(url);
          let jcal = ical.parse(await resp.text());
          console.log(jcal);
          */
        }
        return;
      } else if (intent === "schedule_meeting") {
        conv.send("let's schedule a meeting!");
        return;
      } else if (intent === "setup_calendar") {
        let url = await this.getCalendarURL(conv, true);
        if (url) {
          conv.send("ok, we're all set!");
        }
        return;
      } else if (intent === "help") {
        conv.send("I can schedule a meeting or show your calendar");
        return;
      }
    }

    // Unhandled message.
    conv.send(':confused: :grey_question:');
  }

  /**
   * Called when we're connected to Slack.
   */
  async ready() {
    // Say hi.
    let status_channel = this.slack.channel(this.statusChan);
    if (status_channel) {
      let commit = await gitSummary(__dirname);
      this.slack.send(`:wave: @ ${commit}`, status_channel.id);
    }
  }
}
