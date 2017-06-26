/**
 * Really simple HTTP request router.
 */

import * as http from 'http';
import { URL } from 'url';

export type Handler = (req: http.IncomingMessage,
  res: http.ServerResponse) => void;
export type Params = { [key: string]: string };
export type RouteHandler = (req: http.IncomingMessage,
  res: http.ServerResponse,
  params: Params) => Promise<void> | void;

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class Route {
  public regex: RegExp;
  public paramNames: string[];

  constructor(
    pattern: string,
    public handler: RouteHandler,
  ) {
    // Find patterns like :pat in the pattern. Replace them with regex
    // capture groups.
    this.paramNames = [];
    let patternRegex = "";
    let isParam = false;
    for (let part of pattern.split(/:(\w[\w\d]*)/)) {
      if (isParam) {
        this.paramNames.push(part);
        patternRegex += '([^/]*)';
      } else {
        patternRegex += escapeRegExp(part);
      }
      isParam = !isParam;
    }

    // Match the whole string.
    this.regex = new RegExp('^' + patternRegex + '$');
  }

  public match(url: string): Params | null {
    const match = this.regex.exec(url);
    if (match) {
      // Pack regex capture groups into a key/value mapping.
      let params: Params = {};
      this.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return params;
    }
    return null;
  }
}

export function notFound(req: http.IncomingMessage, res: http.ServerResponse) {
  res.statusCode = 404;
  res.end('not found');
}

export function dispatch(routes: Route[], notFoundHandler=notFound): Handler {
  return async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    if (req.url) {
      // Get the non-query part of the URL.
      let path = (new URL(req.url, 'http://example.com')).pathname;

      // Try dispatching to each route.
      for (let route of routes) {
        let params = route.match(path);
        if (params) {
          await route.handler(req, res, params);
          return;
        }
      }
    }

    // No route matched.
    notFoundHandler(req, res);
  }
}
