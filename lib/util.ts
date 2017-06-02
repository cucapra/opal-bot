/**
 * Miscellaneous utilities.
 */
import * as child_process from 'child_process';
const urlRegex: RegExp = require('url-regex')();

/**
 * Get the current git revision string for a repository.
 */
export function gitSummary(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec('git rev-parse --short HEAD', { cwd: path },
                       (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Extract a URL from a string, if any.
 */
export function findURL(s: string): string | null {
  let matches = s.match(urlRegex);
  if (matches && matches.length) {
    let url = matches[0];
    // The regex is too dumb to remove trailing )s and >s.
    // https://github.com/kevva/url-regex/issues/34
    if (url.endsWith('>')) {
      url = url.slice(0, -1);
    }
    return url;
  } else {
    return null;
  }
}
