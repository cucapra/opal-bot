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
  }

  handler() {
    return this.msgr.middleware();
  }

  onConverse(cbk: basebot.ConversationHandler) {
    console.error("not implemented");
  }
}
