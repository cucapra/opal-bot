/**
 * A bot interface that interacts in a browser.
 */

import * as basebot from './basebot';
import * as http from 'http';
import * as libweb from '../libweb';
const SSE = require('sse-writer');

/**
 * A conversation that interacts with the user in the terminal.
 */
class Conversation implements basebot.Conversation {
  constructor(
    public webbot: WebBot,
    public user: string,
  ) {}

  send(text: string) {
    this.webbot.send(text);
  }

  async recv() {
    return await this.webbot.spool.wait(null);
  }

  namespace = "terminal";
}

export class WebBot implements basebot.Bot {
  public spool = new basebot.Spool<null, string>();
  public onconverse: basebot.ConversationHandler | null = null;
  public sse: any;

  routes() {
    return [
      // Front-end resources.
      new libweb.Route('/chat', (req, res) => {
        libweb.sendfile(res, 'web/chat.html');
      }),
      new libweb.Route('/chat.js', (req, res) => {
        libweb.sendfile(res, 'web/chat.js');
      }),

      // Send and receive messages.
      new libweb.Route('/chat/messages', async (req, res) => {
        if (req.method === 'GET') {
          // Stream messages!
          // TODO Just one connection at a time for now...
          this.sse = new SSE();
          this.sse.pipe(res);
        } else if (req.method === 'POST') {
          // Received a new message.
          let text = await libweb.body(req);
          this.spool.fire(
            this, null, text, text,
            () => new Conversation(this, "user"),
          );
        }
      }),
    ];
  }

  send(text: string) {
    // TODO Add the message to a log so we can send it out even if no one
    // is connected.
    if (this.sse) {
      this.sse.event('message', text);
    }
  }
}

// Smoke test.
let bot = new WebBot();
bot.onconverse = async (text, conv) => {
  console.log(text);
  conv.send("ack! " + text);
};
let server = http.createServer(libweb.dispatch(bot.routes()));
server.listen(4005);
