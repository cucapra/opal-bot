import * as oauth2 from 'simple-oauth2';
import * as libweb from '../libweb';
import * as http from 'http';
import * as url from 'url';

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

export type TokenHandler = (token: oauth2.AccessToken) => void;

/**
 * Create an HTTP route for handling Office 365 authentication.
 */
export function authRoute(clientId: string, clientSecret: string,
                          baseUrl: string, cbk: TokenHandler) {
  let auth = oauth2.create({
    client: { id: clientId, secret: clientSecret },
    auth: OAUTH_PARAMS,
  });

  let callbackUrl = url.resolve(baseUrl, AUTH_ENDPOINT);;
  let authUrl = auth.authorizationCode.authorizeURL({
    redirect_uri: callbackUrl,
    scope: SCOPES.join(" "),
  });
  console.log(authUrl);

  let route = new libweb.Route(AUTH_ENDPOINT, (req, res) => {
    let code = libweb.query(req).get('code');
    if (!code) {
      throw 'no code received';
    }
    auth.authorizationCode.getToken({
      code,
      redirect_uri: callbackUrl,
    }).then(t => {
      let token = auth.accessToken.create(t);
      cbk(token);
    });
    res.end('ok');
  });

  return route;
}

// Smoke test.
let r = authRoute(process.argv[2], process.argv[3],
                  'http://localhost:8191', token => {
  console.log('got a token yo');
});
let server = http.createServer(libweb.dispatch([r]));
server.listen(8191);
