const slack_client = require('@slack/client');

const bot_token = process.env['SLACK_BOT_TOKEN'] || '';

let rtm = new slack_client.RtmClient(bot_token);

interface User {
  id: string;
  name: string;
  prefs: { [key: string]: any };
  created: number;
  manual_presence: string;
};

interface Team {
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

interface Channel {
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

interface RTMStartData {
  ok: boolean;
  self: User;
  team: Team;
  latest_event_ts: string;
  channels: Channel[];
  groups: object[];
  ims: object[];
  cache_ts: number;
  users: object[];
  url: string;
  scopes: string[];
  acceptedScopes: string[];
};

// Event handler for successful connection.
rtm.on(slack_client.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData: RTMStartData) => {
  console.log(`Logged in as ${startData.self.name} of team ${startData.team.name}`);
});

interface Message {
  type: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  source_team: string;
  team: string;
};

rtm.on(slack_client.RTM_EVENTS.MESSAGE, (message: any) => {
  console.log(`${message.user} sez ${message.text}`);
  rtm.sendMessage("hi!", message.channel);
});

rtm.start();
