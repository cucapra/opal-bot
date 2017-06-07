import { EventEmitter } from 'events';
import * as http from 'http';

interface Options {
  token: string;
  app_secret?: string;
  verify?: string;
}

type Callback = (res: {}) => void | null;

declare class Bot extends EventEmitter {
  constructor(opts: Options);
  getProfile(id: string, cb: Callback): void;
  sendMessage(recipient: string, payload: string, cb: Callback): void;
  middleware(): (req: http.IncomingMessage, res: http.ServerResponse) => void;
}

export = Bot;
