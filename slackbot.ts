/**
 * A helper for the Slack API for building bots.
 */

const slack_client = require('@slack/client');

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

export class Bot {
  public rtm: any;

  public channels: Map<string, Channel> = new Map();
  public ims: Map<string, IM> = new Map();
  public status_channel_id: string | null = null;

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
    });
  }

  start() {
    this.rtm.start();
  }
}
