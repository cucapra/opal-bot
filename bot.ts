import * as child_process from 'child_process';
import { Bot, Message } from './slackbot';
import { Wit } from 'node-wit';
import * as util from 'util';

const BOT_TOKEN = process.env['SLACK_BOT_TOKEN'] || '';
const WIT_TOKEN = process.env['WIT_ACCESS_TOKEN'] || '';
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

const wit = new Wit({
  accessToken: WIT_TOKEN,
});

const bot = new Bot(BOT_TOKEN);

bot.on("ready", async () => {
  console.log(`I'm ${bot.self.name} on ${bot.team.name}`);

  // Indicate that we've started.
  let status_channel = bot.channel(STATUS_CHAN);
  if (status_channel) {
    let commit = await git_summary(__dirname);
    bot.send(`:wave: @ ${commit}`, status_channel.id);
  }
});

interface Entity {
  confidence: number;
  value: string;
}

bot.on("message", async (message) => {
  // Parse private messages.
  if (bot.ims.get(message.channel)) {
    console.log(`${message.user}: ${message.text}`);
    let res = await wit.message(message.text, {});
    console.log(`Wit parse: ${util.inspect(res, { depth: undefined })}`);
    for (let name in res.entities) {
      let entities: Entity[] = res.entities[name];
      if (name === "greetings") {
        for (let entity of entities) {
          if (entity.confidence > 0.9) {
            bot.send("hi!", message.channel);
          }
        }
      }
    }
  }
});

bot.start();
