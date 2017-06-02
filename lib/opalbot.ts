/**
 * The core behavior for the OPAL bot.
 */

import * as util from 'util';
import { SlackBot, Message } from './slackbot';
import { Wit } from 'node-wit';
import * as wit from './wit';

import { findURL, gitSummary } from './util';

interface User {
  slack_id: string;
  calendar_url?: string;
}

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

    // Handle new messages.
    slack.onInit(async (message) => {
      // A new private message.
      console.log(`${message.user}: ${message.text}`);
      this.interact(message);
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
  async  getCalendarURL(userId: string,
                        chan: string,
                        force = false): Promise<string | null> {
    // Do we already have a calendar URL for this user?
    let user = this.getUser(userId);
    if (!force && user.calendar_url) {
      return user.calendar_url;
    }

    // Query the user.
    this.slack.send("please paste your calendar URL", chan);
    let url = findURL((await this.slack.wait(chan)).text);
    if (url) {
      console.log(`setting calendar URL to ${url}`);
      user.calendar_url = url;
      this.users.update(user);
      this.db.saveDatabase();
      return url;
    } else {
      this.slack.send("hmm... that doesn't look like a URL", chan);
      return null;
    }
  }

  /**
   * Handle a direct interaction.
   */
  async interact(message: Message) {
    let text = message.text;
    let chan = message.channel;

    let res = await this.wit.message(text, {});
    console.log(`Wit parse: ${util.inspect(res, { depth: undefined })}`);

    if (wit.getEntity(res, "greetings")) {
      this.slack.send("hi!", chan);
      return;
    } else {
      let intent = wit.entityValue(res, "intent");
      if (intent === "show_calendar") {
        this.slack.send("let's get your calendar!", chan);
        let url = await this.getCalendarURL(message.user, chan);
        if (url) {
          this.slack.send(`your calendar URL is ${url}`, chan);
          /*
          let resp = await fetch(url);
          let jcal = ical.parse(await resp.text());
          console.log(jcal);
          */
        }
        return;
      } else if (intent === "schedule_meeting") {
        this.slack.send("let's schedule a meeting!", chan);
        return;
      } else if (intent === "setup_calendar") {
        let url = await this.getCalendarURL(message.user, chan, true);
        if (url) {
          this.slack.send("ok, we're all set!", chan);
        }
        return;
      } else if (intent === "help") {
        this.slack.send("I can schedule a meeting or show your calendar", chan);
        return;
      }
    }

    // Unhandled message.
    this.slack.send(':confused: :grey_question:', chan);
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
