/**
 * A bot backend for Facebook Messenger.
 */

import * as basebot from './basebot';
import Messenger = require('messenger-bot');
import * as http from 'http';

export class FacebookBot implements basebot.Bot {
  public msgr: Messenger;

  constructor(token: string, app_secret: string, verify: string) {
    this.msgr = new Messenger({
      token,
      app_secret,
      verify,
    });

    this.msgr.on('message', (payload: any, reply: any) => {
      console.log(payload);
      console.log(payload.message.text);
      reply({ text: 'hi!!!' }, (err: any) => {
        console.log("err", err);
      });
    });
  }

  handler() {
    return this.msgr.middleware();
  }

  onConverse(cbk: basebot.ConversationHandler) {
    console.error("not implemented");
  }
}
