/**
 * A bot backend for Facebook Messenger.
 */

import * as basebot from './basebot';
import Messenger = require('messenger-bot');
import * as http from 'http';

/**
 * A thread of interaction with a specific Facebook user.
 */
class Conversation implements basebot.Conversation {
  constructor(
    public fb: FacebookBot,
    public user: string,
  ) {}

  /**
   * Send a message to the user.
   */
  send(text: string) {
    this.fb.msgr.sendMessage(this.user, { text }, (err: any) => {
      if (err) {
        throw err;
      }
    });
  }

  /**
   * Receive the next message from the user.
   */
  async recv() {
    let msg = await this.fb.wait(this.user);
    return msg.text;
  }

  namespace = "facebook";
}

export interface Message {
  mid: string;
  seq: number;
  text: string;
}

type MessageHandler = (message: Message) => void;

/**
 * A Facebook Messenger API wrapper for bot-like interactions.
 */
export class FacebookBot implements basebot.Bot {
  public msgr: Messenger;

  /**
   * A list of handlers waiting to consume a message from a given user ID.
   */
  public waiters: [string, MessageHandler][] = [];

  public convHandler: basebot.ConversationHandler | null = null;

  /**
   * Create a Messenger connection with a given page token and webhook verify
   * token.
   */
  constructor(token: string, verify: string) {
    this.msgr = new Messenger({
      token,
      verify,
    });

    this.msgr.on('message', (event) => {
      let callbacks: MessageHandler[] = [];
      this.waiters = this.waiters.filter(([userId, cbk]) => {
        if (userId === event.sender.id) {
          callbacks.push(cbk);
          return false;
        }
        return true;
      });

      if (callbacks.length) {
        // Existing conversation.
        for (let cbk of callbacks) {
          cbk(event.message);
        }
      } else {
        // New conversation.
        let conv = new Conversation(this, event.sender.id);
        if (this.convHandler) {
          this.convHandler(event.message.text, conv);
        }
      }
    });
  }

  /**
   * Get the request handler for receiving webhook requests from the Messenger
   * service.
   */
  handler() {
    return this.msgr.middleware();
  }

  /**
   * Wait for a message from a user.
   */
  wait(userId: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      this.waiters.push([userId, resolve]);
    });
  }

  onConverse(cbk: basebot.ConversationHandler) {
    this.convHandler = cbk;
  }
}
