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

bot.on("ready", () => {
  console.log(`I'm ${bot.self.name} on ${bot.team.name}`);

  // Indicate that we've started.
  let status_channel = bot.channel(status_chan);
  if (status_channel) {
    let cid = status_channel.id;
    git_summary(__dirname).then((commit) => {
      bot.send(`:wave: @ ${commit}`, cid);
    });
  }
});

bot.on("message", (message) => {
  console.log(`${message.user} sez ${message.text}`);

  // Respond to private messages, just for fun.
  if (bot.ims.get(message.channel)) {
    bot.send("hi!", message.channel);
  }
});

bot.start();
