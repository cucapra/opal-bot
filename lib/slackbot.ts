/**
 * A helper for the Slack API for building bots.
 */

const slack_client = require('@slack/client');
import * as basebot from './basebot';

export interface User {
  id: string;
  name: string;
  prefs: { [key: string]: any };
  created: number;
  manual_presence: string;
};

export interface Team {
  id: string;
  name: string;
  email_domain: string;
  domain: string;
  msg_edit_window_mins: number;
  prefs: { [key: string]: any };
  icon: { [key: string]: any };
  over_storage_limit: boolean;
  approaching_msg_limit: false;
  messages_count: number;
  plan: string;
  avatar_base_url: string;
  over_integrations_limit: boolean;
};

export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  name_normalized: string;
  is_shared: boolean;
  is_org_shared: boolean;
  has_pins: boolean;
  is_member: boolean;
  previous_names: string[];
};

export interface IM {
  id: string;
  created: number;
  is_im: boolean;
  is_org_shared: boolean;
  user: string;
  has_pins: false;
  last_read: string;
  latest: any;
  unread_count: number;
  unread_count_display: number;
  is_open: boolean;
};

export interface RTMStartData {
  ok: boolean;
  self: User;
  team: Team;
  latest_event_ts: string;
  channels: Channel[];
  groups: object[];
  ims: IM[];
  cache_ts: number;
  users: object[];
  url: string;
  scopes: string[];
  acceptedScopes: string[];
};

export interface Message {
  type: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  source_team: string;
  team: string;
};

/**
 * Types for our renamed events.
 */
interface Events {
  ready: () => void;
  message: (message: Message) => void;
};

/**
 * Easier names for events in the Slack client library.
 */
const EVENT_IDS = {
  ready: slack_client.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED,
  message: slack_client.RTM_EVENTS.MESSAGE,
};

type MessageHandler = (message: Message) => void;

/**
 * Encapsulates methods for interacting in the scope of a specific channel
 * with a specific user.
 */
export class Conversation implements basebot.Conversation {
  constructor(
    public slack: SlackBot,
    public chanId: string,
    public user: string,
  ) {}

  /**
   * Send a message on the channel.
   */
  send(text: string) {
    this.slack.send(text, this.chanId);
  }

  /**
   * Receive a message on the channel.
   */
  async recv() {
    return (await this.slack.wait(this.chanId)).text;
  }

  /**
   * The namespace is just "slack". Eventually, this should probably
   * identify the team.
   */
  namespace = "slack";
}

/**
 * Wraps a Slack client for bot-like interactions.
 */
export class SlackBot implements basebot.Bot {
  public rtm: any;

  public channels: Map<string, Channel> = new Map();
  public ims: Map<string, IM> = new Map();
  public team: Team;
  public self: User;

  /**
   * A list of handlers waiting to consume a message from a given channel
   * indicated by its ID.
   */
  public waiters: [string, MessageHandler][] = [];

  /**
   * A handler for messages that no one's waiting for.
   */
  public convHandler: basebot.ConversationHandler | null = null;

  /**
   * Construct a bot by creating a Slack RTM client object and attach this
   * bot's listeners.
   */
  constructor(token: string) {
    this.rtm = new slack_client.RtmClient(token);

    // Event handler for successful connection.
    this.rtm.on(slack_client.CLIENT_EVENTS.RTM.AUTHENTICATED,
                (startData: RTMStartData) => {
      for (let channel of startData.channels) {
        this.channels.set(channel.id, channel);
      }
      for (let im of startData.ims) {
        this.ims.set(im.id, im);
      }

      this.team = startData.team;
      this.self = startData.self;
    });

    // Event handler for dispatching waited-on messages.
    this.on("message", (message) => {
      // Get the callbacks for this message and remove them from the list
      // of pending waiters.
      let callbacks: MessageHandler[] = [];
      this.waiters = this.waiters.filter(([channel_id, callback]) => {
        if (message.channel == channel_id) {
          callbacks.push(callback);
          return false;
        }
        return true;
      });

      if (callbacks.length) {
        // Invoke the callbacks.
        for (let callback of callbacks) {
          callback(message);
        }
      } else {
        // No one is waiting for this message.
        if (this.convHandler && this.ims.get(message.channel)) {
          // This is a private message. (Eventually, we should also handle
          // mentions.) Call the conversation handler.
          this.convHandler(
            message.text,
            new Conversation(this, message.channel, message.user)
          );
        }
      }
    });
  }

  /**
   * Get a channel by its name, if it exists and we're a member.
   */
  channel(name: string): Channel | null {
    for (let [, channel] of this.channels) {
      if (channel.name === name && channel.is_member) {
        return channel;
      }
    }
    return null;
  }

  /**
   * Send a message.
   */
  send(message: string, channel_id: string) {
    this.rtm.sendMessage(message, channel_id);
  }

  /**
   * Start the connection.
   */
  start() {
    this.rtm.start();
  }

  /**
   * Nicer interface to listeners.
   */
  on(event: keyof Events, listener: Events[typeof event]) {
    this.rtm.on(EVENT_IDS[event], listener);
  }

  /**
   * Wait for a message on a given channel.
   */
  wait(channel_id: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      this.waiters.push([channel_id, resolve]);
    });
  }

  /**
   * Handle (directed) messages that no one else wants.
   */
  onConverse(handler: basebot.ConversationHandler) {
    this.convHandler = handler;
  }
}
