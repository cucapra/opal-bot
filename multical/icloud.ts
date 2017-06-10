/**
 * Scaffolding for interacting with the iCloud API.
 */

import fetch from 'node-fetch';

const ICLOUD_URL = "https://www.icloud.com";
const SETUP_URL = "https://setup.icloud.com/setup/ws/1";
const USER_AGENT = "opal/1.0.0";

async function main() {
  let apple_id = process.argv[2];
  let password = process.argv[3];

  let body = {
    apple_id,
    password,
  };

  let resp = await fetch(SETUP_URL + '/login', {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      // The iCloud API appears to require the Origin header to be set to the
      // iCloud URL.
      'Origin': ICLOUD_URL,

      // Just for politeness.
      'User-Agent': USER_AGENT,
    },
  });

  // General iCloud API errors.
  if (resp.status === 400) {
    let data = JSON.parse(await resp.text());
    console.error(`error: ${data['error']}`);
    return;
  } else if (!resp.ok) {
    console.error(`HTTP error: ${resp.status} ${resp.statusText}`);
    console.log(await resp.text());
    return;
  }

  console.log(await resp.text());
}

main();
