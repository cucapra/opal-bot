import * as child_process from 'child_process';
import { Bot, Message, RTMStartData } from './slackbot';
const slack_client = require('@slack/client');

const BOT_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const STATUS_CHAN = 'bot-status';

/**
 * Get the current git revision string for a repository.
 */
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

let bot = new Bot(BOT_TOKEN);

bot.on("ready", async () => {
  console.log(`I'm ${bot.self.name} on ${bot.team.name}`);

  // Indicate that we've started.
  let status_channel = bot.channel(STATUS_CHAN);
  if (status_channel) {
    let commit = await git_summary(__dirname);
    bot.send(`:wave: @ ${commit}`, status_channel.id);
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
