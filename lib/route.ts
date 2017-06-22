/**
 * Really simple HTTP request router.
 */

import * as http from 'http';

export type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

export class Route {
  constructor(
    public method: string,
    public pattern: RegExp,
    public handler: Handler,
  ) {}
}

export function route(method: string, pattern: RegExp, handler: Handler) {
  return new Route(method, pattern, handler);
}

function notFoundHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  res.statusCode = 404;
  res.end('not found');
}

export function dispatch(routes: Route[], notFound=notFoundHandler): Handler {
  return (req, res) => {
    // Try dispatching to each route.
    for (let route of routes) {
      if (req.method && req.url) {
        if (req.method.toUpperCase() === route.method.toUpperCase()
            && route.pattern.test(req.url)) {
          route.handler(req, res);
          return;
        }
      }
    }

    // No route matched.
    notFound(req, res);
  }
}
