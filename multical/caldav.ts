import fetch from 'node-fetch';

const QUERY_XML = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="20170101T120000Z" end="20170115T120000Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

function base64encode(s: string) {
  return new Buffer(s).toString('base64');
}

function basicauth(username: string, password: string): string {
  return 'Basic ' + base64encode(username + ":" + password);
}

async function getSomeEvents(url: string, username: string, password: string)
{
  let res = await fetch(url, {
    method: 'REPORT',
    headers: {
      'Content-Type': 'text/xml',
      'Authorization': basicauth(username, password),
      'User-Agent': 'opal/1.0.0',
    },
    body: QUERY_XML,
  });
  console.log(res.status);
  console.log(res.headers);
  console.log(await res.text());
}

getSomeEvents(process.argv[2], process.argv[3], process.argv[4]);
