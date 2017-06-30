/**
 * A bot interface that interacts in a browser.
 */

import * as basebot from './basebot';
import * as libweb from '../libweb';
import * as http from 'http';
import * as util from 'util';
import SSE = require('sse-writer');

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

  namespace = "web";
}

/**
 * A bot interface that communicates through a Web interface.
 */
export class WebBot implements basebot.Bot {
  public spool = new basebot.Spool<null, string>();
  public onconverse: basebot.ConversationHandler | null = null;
  public sse = new SSE();

  /**
   * The server routes for interacting with the bot.
   */
  routes() {
    return [
      // Front-end resources.
      new libweb.Route('/chat', libweb.file('web/chat.html')),
      new libweb.Route('/chat.js',
        libweb.file('web/chat.js', 'application/javascript')),
      new libweb.Route('/chat.css', libweb.file('web/chat.css', 'text/css')),

      // Send and receive messages.
      new libweb.Route('/chat/messages', async (req, res) => {
        if (req.method === 'GET') {
          // Pipe our SSE writer to this stream.
          this.sse.pipe(res);
        } else if (req.method === 'POST') {
          // Received a new message.
          // TODO All web users are considered the same for now.
          let text = await libweb.body(req);
          this.spool.fire(
            this, null, text, text,
            () => new Conversation(this, "user"),
          );

          // Acknowledge the message.
          res.end('ok');
        }
      }),
    ];
  }

  send(text: string) {
    // TODO Add the message to a log so we can send it out even if no one
    // is connected.
    this.sse.event('message', text);
  }
}
