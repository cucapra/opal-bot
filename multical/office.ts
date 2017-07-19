import * as oauth2 from 'simple-oauth2';
import * as libweb from '../libweb';
import * as http from 'http';
import * as url from 'url';
import * as crypto from 'crypto';

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
const AUTH_ENDPOINT = '/authorize';

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
 * The type for callbacks for successful authentication.
 */
export type TokenHandler = (token: oauth2.AccessToken) => void;

export interface Authentication {
  url: string;
  token: Promise<oauth2.AccessToken>;
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

    this.authRoute = new libweb.Route(AUTH_ENDPOINT, (req, res) => {
      let query = libweb.query(req);
      let code = query.get('code');
      if (!code) {
        throw 'no code received';
      }

      this.auth.authorizationCode.getToken({
        code,
        redirect_uri: this.callbackUrl,
      }).then(t => {
        console.log(t);
        let token = this.auth.accessToken.create(t);
        this.authenticated(query.get('state'), token);
      });
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

    let promise = new Promise<oauth2.AccessToken>((resolve, reject) => {
      this.handlers.set(state, resolve);
    });

    return { url, token: promise };
  }

  /**
   * Our internal callback for when the authentication URL is triggered.
   */
  authenticated(state: string | null, token: oauth2.AccessToken) {
    if (!state) {
      return;
    }
    let cbk = this.handlers.get(state);
    if (cbk) {
      cbk(token);
    }
  }
}

// Smoke test.
async function main() {
  let c = new Client(process.argv[2], process.argv[3], 'http://localhost:8191');
  let server = http.createServer(libweb.dispatch([c.authRoute]));
  server.listen(8191);
  let auth = await c.authenticate();
  console.log(auth.url);
  let token = await auth.token;
  console.log('got a token!!!');
}
main();
