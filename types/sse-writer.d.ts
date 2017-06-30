import * as stream from 'stream';

/**
 * Wrap an output stream to produce Server-Sent Events data.
 */
declare class SSE extends stream.Transform {
  /**
   * Send a comment.
   */
  comment(text: string): this;

  /**
   * Send an event to the client.
   */
  event(params: {id: number, name: string, data: string}): this;
  event(id: number, name: string, data: string): this;
  event(name: string, data: string): this;
  event(data: string): this;
}

export = SSE;
