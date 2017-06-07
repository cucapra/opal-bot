import { EventEmitter } from 'events';
import * as http from 'http';

interface Options {
  token: string;
  app_secret?: string;
  verify?: string;
}

type Callback = (res: {}) => void | null;

interface MessageEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message: {
    mid: string;
    seq: number;
    text: string;
  };
}

declare class Bot extends EventEmitter {
  constructor(opts: Options);
  getProfile(id: string, cb: Callback): void;
  sendMessage(recipient: string, payload: { text: string }, cb: Callback): void;
  middleware(): (req: http.IncomingMessage, res: http.ServerResponse) => void;

  on(event: "message", listener: (event: MessageEvent) => void): this;
}

export = Bot;
