import * as child_process from 'child_process';
const slack_client = require('@slack/client');

const bot_token = process.env['SLACK_BOT_TOKEN'] || '';
const status_chan = 'bot-status';

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

interface IM {
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

interface RTMStartData {
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

// State bits that should be come fields someday.
let cur_channels: { [id: string]: Channel } = {};
let cur_ims: { [id: string]: IM } = {};
let status_channel_id: string | null = null;

// Event handler for successful connection.
rtm.on(slack_client.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData: RTMStartData) => {
  console.log(`logged in as ${startData.self.name} to ${startData.team.name}`);

  for (let channel of startData.channels) {
    cur_channels[channel.id] = channel;
  }
  for (let im of startData.ims) {
    cur_ims[im.id] = im;
  }

  // Look for the status channel.
  for (let channel of startData.channels) {
    if (channel.name === status_chan && channel.is_member) {
      status_channel_id = channel.id;
    }
  }
});

function git_commit(path: string): Promise<string> {
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

rtm.on(slack_client.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  // Indicate that we've started.
  if (status_channel_id) {
    git_commit(__dirname).then((commit) => {
      rtm.sendMessage(`:wave: @ ${commit}`, status_channel_id);
    });
  }
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

  // Respond to private messages, just for fun.
  if (cur_ims[message.channel]) {
    rtm.sendMessage("hi!", message.channel);
  }
});

rtm.start();
