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

import { findURL, gitSummary, IVars, randomString } from './util';

/**
 * Our data model for keeping track of users' data.
 */
interface User {
  slack_id: string;
  icloud?: {
    appleid: string;
    password: string;
  };
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
   * Web sessions. Maps opaque URL tokens to callbacks that continue the
   * conversation.
   */
  public webSessions = new IVars<route.Params>();

  /**
   * The configuration server URL (if it's running).
   */
  public webURL: string | null = null;

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
  runWeb(port: number, rsrcdir='web'): Promise<void> {
    let r = new route.Route('/settings/:token', async (req, res, params) => {
      // Make sure we have a valid token.
      let token = params['token'];
      if (!this.webSessions.has(token)) {
        res.statusCode = 404;
        res.end('invalid token');
        return;
      }

      if (req.method === 'GET') {
        // Send the form.
        webutil.sendfile(res, path.join(rsrcdir, 'settings.html'));
      } else if (req.method === 'POST') {
        // Retrieve the settings.
        let data = await webutil.formdata(req);
        this.webSessions.put(token, data);
        res.end('got it; thanks!');
      } else {
        route.notFound(req, res);
      }
    });
    let server = http.createServer(route.dispatch([r]));

    return new Promise<void>((resolve, reject) => {
      server.listen(port, () => {
        this.webURL = `http://localhost:${port}`;
        console.log(`web interface running at ${this.webURL}`);
        resolve();
      });
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
   * Interact with the user to get their settings.
   */
  async gatherSettings(conv: Conversation) {
    let token = randomString();
    conv.send(`please fill out the form at ${this.webURL}/settings/${token}`);
    return await this.webSessions.get(token);
  }

  async getSettings(conv: Conversation, force=false) {
    let user = this.getUser(conv);
    if (!force) {
      if (user.icloud) {
        return "icloud";
      }
    }

    let resp = await this.gatherSettings(conv);
    if (resp['service'] === 'icloud') {
      user.icloud = {
        'appleid': resp['appleid'],
        'password': resp['password'],
      };
      return "icloud";
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
    let settings = await this.getSettings(conv);
    if (settings) {
      conv.send(settings);
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
    await this.getSettings(conv, true);
    conv.send("ok, all set!");
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
