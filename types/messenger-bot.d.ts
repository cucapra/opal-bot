import { EventEmitter } from 'events';
import * as http from 'http';

interface Options {
  token: string;
  app_secret?: string;
  verify?: string;
}

type Callback = (res: {}) => void | null;

interface Event {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
}

interface MessageEvent extends Event {
  message: {
    mid: string;
    seq: number;
    text: string;
  };
}

interface PostbackEvent extends Event {
  postback: {
    payload: string;
    referral: any;
  };
}

interface Message {
  // Either text or attachment must be set. For now, the types requre text.
  text: string;
  attachment?: any;
  quick_reples?: any;
  metadata?: any;
}

declare class Bot extends EventEmitter {
  constructor(opts: Options);
  getProfile(id: string, cb: Callback): void;
  sendMessage(recipient: string, payload: Message, cb: Callback): void;
  middleware(): (req: http.IncomingMessage, res: http.ServerResponse) => void;

  on(event: "message", listener: (event: MessageEvent) => void): this;
  on(event: "postback", listener: (event: PostbackEvent) => void): this;
}

export = Bot;
