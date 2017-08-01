import * as oauth2 from 'simple-oauth2';
import * as libweb from '../libweb';
import * as http from 'http';
import * as url from 'url';
import * as crypto from 'crypto';
import * as outlook from 'node-outlook';
import * as jwt from 'jsonwebtoken';

/**
 * OAuth2 parameters for connecting to Office 365.
 */
const OAUTH_PARAMS = {
  tokenHost: "https://login.microsoftonline.com",
  tokenPath: "common/oauth2/v2.0/token",
  authorizePath: "common/oauth2/v2.0/authorize",
};

/**
 * The OAuth2 scopes we need to request.
 */
const SCOPES = [
  "openid",
  "profile",  // Required to get user's email address.
  "https://outlook.office.com/calendars.readwrite",
];

/**
 * The path for OAuth2 callbacks.
 */
const AUTH_ENDPOINT = '/office/auth';

/**
 * Generate a random string for use as a token.
 */
async function randomString(bytes = 32): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('base64'));
      }
    });
  });
}

/**
 * The token you need to authenticate requests to the Office API.
 */
export type Token = oauth2.AccessToken;

/**
 * The type for callbacks for successful authentication.
 */
export type TokenHandler = (token: Token) => void;

/**
 * An Office 365 authentication request.
 */
export interface Authentication {
  /**
   * The URL that the user should follow to log in to Office 365 in a
   * browser.
   */
  url: string;

  /**
   * A promise that resolves when the user has successfully completed the
   * login flow in the browser. Produces an authentication token that
   * can be used for future requests.
   */
  token: Promise<Token>;
};

/**
 * A client for dispatching authentication requests to the Office365 API.
 */
export class Client {
  readonly authRoute: libweb.Route;
  readonly auth: oauth2.OAuthClient;
  readonly callbackUrl: string;
  readonly handlers = new Map<string, TokenHandler>();

  constructor(id: string, secret: string, baseUrl: string) {
    this.auth = oauth2.create({
      client: { id, secret },
      auth: OAUTH_PARAMS,
    });

    this.callbackUrl = url.resolve(baseUrl, AUTH_ENDPOINT);

    this.authRoute = new libweb.Route(AUTH_ENDPOINT, async (req, res) => {
      let query = libweb.query(req);
      let code = query.get('code');
      if (!code) {
        console.error('missing code');
        res.end('missing code');
        return;
      }

      let t: oauth2.Token;
      try {
        t = await this.auth.authorizationCode.getToken({
          code,
          redirect_uri: this.callbackUrl,
        });
      } catch (err) {
        console.error('authorization error', err);
        res.end('token authorization error');
        return;
      }

      let token = this.auth.accessToken.create(t);
      this.authenticated(query.get('state'), token);
      res.end('ok');
    });
  }

  /**
   * Authenticate a user. This returns both the URL that the user should
   * follow to authenticate and a promise that resolves when the
   * authentication succeeds.
   */
  async authenticate(): Promise<Authentication> {
    let state = await randomString();

    let url = this.auth.authorizationCode.authorizeURL({
      redirect_uri: this.callbackUrl,
      scope: SCOPES.join(" "),
      state,
    });

    let promise = new Promise<Token>((resolve, reject) => {
      this.handlers.set(state, resolve);
    });

    return { url, token: promise };
  }

  /**
   * Our internal callback for when the authentication URL is triggered.
   */
  authenticated(state: string | null, token: Token) {
    if (!state) {
      return;
    }
    let cbk = this.handlers.get(state);
    if (cbk) {
      cbk(token);
    }
  }
}

/**
 * Convert a nonnegative integer to a string, padded with a zero if it's
 * only a single digit.
 */
function pad0(n: number): string {
  if (n < 10) {
    return '0' + n;
  } else {
    return n.toString();
  }
}

/**
 * Given a JavaScript `Date`, format a string for the Office 365 REST API.
 */
function officeDateLocal(d: Date): string {
  return d.getFullYear() +
    '-' + pad0(d.getMonth() + 1) +
    '-' + pad0(d.getDate()) +
    'T' + pad0(d.getHours()) +
    ':' + pad0(d.getMinutes()) +
    ':' + pad0(d.getSeconds());
}

/**
 * Given a JavaScript `Date`, create an Office 365 REST API object consisting
 * of a `DateTime` value and a `TimeZone` string. This makes a time value in
 * UTC, which is always correct but loses the time zone information.
 */
function officeDateUTC(d: Date) {
  let s = d.getUTCFullYear() +
    '-' + pad0(d.getUTCMonth() + 1) +
    '-' + pad0(d.getUTCDate()) +
    'T' + pad0(d.getUTCHours()) +
    ':' + pad0(d.getUTCMinutes()) +
    ':' + pad0(d.getUTCSeconds());
  return { DateTime: s, TimeZone: 'UTC' };
}

/**
 * Get an authenticated user's email address.
 *
 * Since we request the appropriate scope, the token contains the user's email
 * (which serves as their user ID) embedded within it.
 */
function emailFromToken(token: Token): string {
  // Hack to extract the ID token from the OAuth token structure. This is a
  // base64-encoded JSON Web Token.
  let id_token: string = (token.token as any).id_token;
  let data = jwt.decode(id_token);
  if (!data) {
    throw "could not decode token";
  }
  return (data as any).preferred_username;
}

/**
 * The parameters for `Calendar.request`.
 * 
 * This is a subset of the parameters for the underlying library. We provide
 * the authentication token and the user details.
 */
type RequestParams = Pick<outlook.APICallParams, 'url' | 'method' | 'query'>;

/**
 * Views onto a particular Office 365 user's calendar data.
 */
export class Calendar {
  public readonly email: string;

  constructor(
    public readonly token: Token
  ) {
    this.email = emailFromToken(token);
  }

  /**
   * Internal wrapper for Office API requests.
   */
  request(params: RequestParams): Promise<any> {
    // The Office API only wants the access token string. And the OAuth
    // library's typings don't make this public, so we need to resort to
    // a hack...
    let atoken: string = (this.token.token as any).access_token;
    
    // Add on our user-identifying parameters.
    let fullParams = {
      token: atoken,
      user: {
        email: "xxx",
        timezone: "UTC",
      },
      ...params
    };
    
    // Make the API call.
    return new Promise<any>((resolve, reject) => {
      outlook.base.makeApiCall(fullParams, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject("HTTP error " + response.statusCode +
                 "; body: " + JSON.stringify(response.body));
        } else {
          resolve(response.body);
        }
      });
    });
  }

  /**
   * Get event instances from the user's calendar between the two dates.
   */
  getEvents(start: Date, end: Date) {
    return this.request({
      url: 'https://outlook.office.com/api/v2.0/me/calendarview',
      method: 'GET',
      query: {
        'StartDateTime': officeDateLocal(start),
        'EndDateTime': officeDateLocal(end),
      },
    });
  }
}
