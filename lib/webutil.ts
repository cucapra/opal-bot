import * as http from 'http';
import * as querystring from 'querystring';
import * as fs from 'fs';

/**
 * Read all the data from an HTTP request.
 */
export function body(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

/**
 * Read the body of the request as urlencoded form data.
 */
export async function formdata(req: http.IncomingMessage) {
  let s = await body(req);
  return querystring.parse(s);
}

/**
 * Send a file from the filesystem as an HTTP response.
 */
export function sendfile(res: http.ServerResponse, path: string, mime='text/html') {
  res.statusCode = 200;
  res.setHeader('Content-Type', mime);
  fs.createReadStream(path).pipe(res);
}
