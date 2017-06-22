/**
 * Really simple HTTP request router.
 */

import * as http from 'http';

export type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;
export type Params = { [key: string]: string };

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class Route {
  public regex: RegExp;
  public pattern: string;
  public paramNames: string[];

  constructor(
    public method: string,
    pattern: string,
    public handler: Handler,
  ) {
    this.pattern = pattern.toUpperCase();

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

  public match(req: http.IncomingMessage): Params | null {
    if (req.method && req.method.toUpperCase() == this.method && req.url) {
      const params = this.regex.exec(req.url);
      if (params) {
        let namedParams: Params = {};

        // Pack regex capture groups into a key/value mapping.
        this.paramNames.forEach((name, i) => {
          namedParams[name] = params[i];
        });
        return namedParams;
      }
    }
    return null;
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
