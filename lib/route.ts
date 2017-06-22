/**
 * Really simple HTTP request router.
 */

import * as http from 'http';

export type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class Route {
  public regex: RegExp;
  public pattern: string;

  constructor(
    public method: string,
    pattern: string,
    public handler: Handler,
  ) {
    this.pattern = pattern.toUpperCase();
    this.regex = new RegExp('^' + escapeRegExp(pattern) + '$');
  }

  public match(req: http.IncomingMessage) {
    if (req.method && req.method.toUpperCase() == this.method &&
        req.url && this.regex.test(req.url)) {
      return true;
    }
    return false;
  }
}

function notFoundHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  res.statusCode = 404;
  res.end('not found');
}

export function dispatch(routes: Route[], notFound=notFoundHandler): Handler {
  return (req, res) => {
    // Try dispatching to each route.
    for (let route of routes) {
      if (route.match(req)) {
        route.handler(req, res);
        return;
      }
    }

    // No route matched.
    notFound(req, res);
  }
}
