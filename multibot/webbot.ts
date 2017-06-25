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
      new libweb.Route('/chat/events', (req, res) => {
        let sse = new SSE();
        sse.pipe(res);
        sse.event('test', 'hello');
        setTimeout(() => {
          sse.event('test', 'foo');
        }, 1000);
      }),
    ];
  }
}

// Smoke test.
let server = http.createServer(libweb.dispatch(new WebBot().routes()));
server.listen(4005);
