/**
 * The core behavior for the OPAL bot.
 */

import * as util from 'util';
import { Bot, Conversation } from '../multibot';
import { SlackBot } from '../multibot/slackbot';
import { TerminalBot } from '../multibot/termbot';
import { FacebookBot } from '../multibot/fbbot';
import { Wit } from 'node-wit';
import * as wit from './wit';
import * as route from './route';
import * as http from 'http';
import * as webutil from './webutil';
import * as path from 'path';

import fetch from 'node-fetch';

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
  /**
   * User settings, stored in the database.
   */
  public users: LokiCollection<User>;

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
   * Run a server to interact with Facebook Messenger.
   */
  runFacebook(token: string, verify: string, port: number) {
    let fb = new FacebookBot(token, verify);
    this.register(fb);

    // Start an HTTP server with this handler.
    let server = http.createServer(fb.handler());
    server.listen(port);
  }

  /**
   * EXPERIMENTAL: Run the configuration Web server.
   */
  runWeb(port: number, rsrcdir='web') {
    let routes = [
      new route.Route('GET', '/settings/:token', async (req, res, params) => {
        webutil.sendfile(res, path.join(rsrcdir, 'settings.html'));
      }),

      new route.Route('POST', '/settings/:token', async (req, res, params) => {
        let token = params['token'];
        let data = await webutil.formdata(req);
        console.log(data);
      }),
    ];
    let server = http.createServer(route.dispatch(routes));
    server.listen(port, () => {
      console.log(`web interface running at http://localhost:${port}`);
    });
  }

  /**
   * Register this bot's callbacks with a connection.
   */
  register(bot: Bot) {
    bot.onconverse = async (text, conv) => {
      await this.interact(text, conv);
    };
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
