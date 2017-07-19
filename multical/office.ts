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

export type TokenHandler = (token: oauth2.AccessToken) => void;

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

  async authenticate(cbk: TokenHandler) {
    let state = await randomString();
    this.handlers.set(state, cbk);

    return this.auth.authorizationCode.authorizeURL({
      redirect_uri: this.callbackUrl,
      scope: SCOPES.join(" "),
      state,
    });
  }

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
  let u = await c.authenticate(token => {
    console.log("got that token fam");
  });
  console.log(u);
}
main();
