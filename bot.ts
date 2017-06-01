import * as child_process from 'child_process';
import { Bot, Message, RTMStartData } from './slackbot';
const slack_client = require('@slack/client');

const bot_token = process.env['SLACK_BOT_TOKEN'] || '';
const status_chan = 'bot-status';

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

let bot = new Bot(bot_token);

bot.rtm.on(slack_client.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  console.log(`I'm ${bot.self.name} on ${bot.team.name}`);

  // Look for the status channel.
  let status_channel_id: string | null = null;
  for (let [id, channel] of bot.channels) {
    if (channel.name === status_chan && channel.is_member) {
      status_channel_id = channel.id;
    }
  }

  // Indicate that we've started.
  if (status_channel_id) {
    let cid = status_channel_id;
    git_summary(__dirname).then((commit) => {
      bot.send(`:wave: @ ${commit}`, cid);
    });
  }
});

bot.rtm.on(slack_client.RTM_EVENTS.MESSAGE, (message: Message) => {
  console.log(`${message.user} sez ${message.text}`);

  // Respond to private messages, just for fun.
  if (bot.ims.get(message.channel)) {
    bot.send("hi!", message.channel);
  }
});

bot.start();
