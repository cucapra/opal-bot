/**
 * A bot interface that interacts in a browser.
 */

import * as basebot from './basebot';
import * as http from 'http';
import * as libweb from '../libweb';
const SSE = require('sse-writer');

export class WebBot {
  routes() {
    return [
      new libweb.Route('/chat', (req, res) => {
        libweb.sendfile(res, 'web/chat.html');
      }),
      new libweb.Route('/chat.js', (req, res) => {
        libweb.sendfile(res, 'web/chat.js');
      }),
      new libweb.Route('/chat/messages', async (req, res) => {
        if (req.method === 'GET') {
          // Stream messages!
          let sse = new SSE();
          sse.pipe(res);
          sse.event('message', 'hello');
          setTimeout(() => {
            sse.event('message', 'foo');
          }, 1000);
        } else if (req.method === 'POST') {
          // Received a new message.
          let msg = await libweb.body(req);
          console.log(msg);
        }
      }),
    ];
  }
}

// Smoke test.
let server = http.createServer(libweb.dispatch(new WebBot().routes()));
server.listen(4005);
