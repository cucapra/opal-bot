import * as oauth2 from 'simple-oauth2';
import * as libweb from '../libweb';
import * as http from 'http';

/**
 * The OAuth2 scopes we need to request.
 */
const SCOPES = [
    "openid",
    "profile",  // Required to get user's email address.
    "https://outlook.office.com/calendars.readwrite",
];

function auth(clientId: string, clientSecret: string) {
  let auth = oauth2.create({
    client: {
      id: clientId,
      secret: clientSecret,
    },
    auth: {
      tokenHost: "https://login.microsoftonline.com",
      tokenPath: "common/oauth2/v2.0/token",
      authorizePath: "common/oauth2/v2.0/authorize",
    },
  });

  let callbackUrl = "http://localhost:8191/authorize";
  let authUrl = auth.authorizationCode.authorizeURL({
    redirect_uri: callbackUrl,
    scope: SCOPES.join(" "),
  });
  console.log(authUrl);

  let authRoute = new libweb.Route('/authorize', (req, res) => {
    let code = libweb.query(req).get('code');
    if (!code) {
      throw 'no code received';
    }
    auth.authorizationCode.getToken({
      code,
      redirect_uri: callbackUrl,
    }).then(t => {
      let token = auth.accessToken.create(t);
      console.log('token!', token);
    });
    res.end('done');
  });

  let server = http.createServer(libweb.dispatch([authRoute]));
  server.listen(8191);
}

auth(process.argv[2], process.argv[3]);
