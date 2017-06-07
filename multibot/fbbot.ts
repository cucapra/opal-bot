/**
 * A bot backend for Facebook Messenger.
 */

import * as basebot from './basebot';
import Messenger = require('messenger-bot');
import * as http from 'http';

export class FacebookBot implements basebot.Bot {
  public msgr: Messenger;

  constructor(token: string, verify: string) {
    this.msgr = new Messenger({
      token,
      verify,
    });

    this.msgr.on('message', (event) => {
      console.log(event);
      console.log(event.message.text);

      this.msgr.sendMessage(event.sender.id, { text: 'hi!!!' }, (err: any) => {
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
