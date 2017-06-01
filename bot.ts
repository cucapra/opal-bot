import * as child_process from 'child_process';
import { Bot, Message, RTMStartData } from './slackbot';
const slack_client = require('@slack/client');

const bot_token = process.env['SLACK_BOT_TOKEN'] || '';
const status_chan = 'bot-status';

let bot = new Bot(bot_token);

// Event handler for successful connection.
bot.rtm.on(slack_client.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData: RTMStartData) => {
  console.log(`logged in as ${startData.self.name} to ${startData.team.name}`);

});

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

bot.rtm.on(slack_client.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  // Look for the status channel.
  let status_channel_id: string | null = null;
  for (let channel_id in bot.cur_channels) {
    let channel = bot.cur_channels[channel_id];
    if (channel.name === status_chan && channel.is_member) {
      status_channel_id = channel.id;
    }
  }

  // Indicate that we've started.
  if (status_channel_id) {
    git_summary(__dirname).then((commit) => {
      bot.rtm.sendMessage(`:wave: @ ${commit}`, status_channel_id);
    });
  }
});

bot.rtm.on(slack_client.RTM_EVENTS.MESSAGE, (message: Message) => {
  console.log(`${message.user} sez ${message.text}`);

  // Respond to private messages, just for fun.
  if (bot.cur_ims[message.channel]) {
    bot.rtm.sendMessage("hi!", message.channel);
  }
});

bot.start();
