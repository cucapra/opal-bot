import fetch from 'node-fetch';
import * as xml2js from 'xml2js';
import * as ical from 'ical.js';
import * as calendar from '../lib/calendar';
import * as moment from 'moment';

function davtime(t: moment.Moment) {
  return t.format('YYYYMMDD[T]HHmmss[Z]');
}

function range_query(start: moment.Moment, end: moment.Moment) {
  return `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${davtime(start)}" end="${davtime(end)}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;
};

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

function firstEvent(ics: string) {
  let cal = calendar.parse(ics);
  for (let event of calendar.getEvents(cal)) {
    return event;
  }
}

async function getSomeEvents(url: string, username: string, password: string)
{
  let start = moment();
  let end = moment().add(7, 'days');
  let query_xml = range_query(start, end);

  let res = await fetch(url, {
    method: 'REPORT',
    headers: {
      'Content-Type': 'text/xml',
      'Authorization': basicauth(username, password),
      'User-Agent': 'opal/1.0.0',
    },
    body: query_xml,
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
    let event = firstEvent(ics);
    if (event) {
      console.log(event.summary);
    }
  }
}

getSomeEvents(process.argv[2], process.argv[3], process.argv[4]);
