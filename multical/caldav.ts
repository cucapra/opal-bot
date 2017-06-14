import fetch from 'node-fetch';
import * as xml2js from 'xml2js';

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

function parseXML(s: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(s, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
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
  if (!res.ok) {
    throw "error communicating with CalDAV server";
  }
  let data = await parseXML(await res.text());

  // The response XML document has this form:
  // <multistatus>
  //   <response><propstat><prop><calendar-data>[ICS HERE]
  //   ...
  // </multistatus>
  for (let response of data['multistatus']['response']) {
    let ics = response['propstat'][0]['prop'][0]['calendar-data'][0]['_'];
    console.log(ics);
  }
}

getSomeEvents(process.argv[2], process.argv[3], process.argv[4]);
