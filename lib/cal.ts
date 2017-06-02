import * as ical from 'ical.js';

/**
 * Parse the first component from an iCal document. Can raise a ParseError.
 */
export function parse(s: string): ical.Component {
  let jcal = ical.parse(s);
  return new ical.Component(jcal as any);
}

/**
 * Generate all the Events in a calendar.
 */
export function* getEvents(cal: ical.Component): Iterable<ical.Event> {
  for (let vevent of cal.getAllSubcomponents('vevent')) {
    yield new ical.Event(vevent);
  }
}

/**
 * Get all the occurrences of a given Event in a time range. This works on
 * both repeating and non-repeating events: non-repeating events just have
 * a single "occurrence."
 */
export function* eventOcurrences(event: ical.Event,
                                 start: ical.Time, end: ical.Time) {
  if (event.isRecurring()) {
    // Multiple occurrences.
    let it = event.iterator();
    let tm: ical.Time | null = null;
    while (tm = it.next()) {
      if (tm.compare(end) === 1) {  // tm > end
        break;
      }
      if (tm.compare(start) !== -1) {  // tm >= start
        yield tm;
      }
    }

  } else {
    // Just one "occurrence".
    if (event.endDate.compare(start) !== -1  // endDate >= start
        && event.startDate.compare(end) !== 1) {  // startDate <= end
      yield event.startDate;
    }
  }
}

/**
 * Generate event/start-time pairs for all the occurrenes of all the events
 * in a calendar in a given range.
 */
export function* getOccurrences(cal: ical.Component, start: ical.Time, end: ical.Time):
  Iterable<[ical.Event, ical.Time]>
{
  for (let event of getEvents(cal)) {
    for (let tm of eventOcurrences(event, start, end)) {
      yield [event, tm];
    }
  }
}

/**
 * Get the date on which a time falls.
 */
function dateOfTime(time: ical.Time): ical.Time {
  let timeJSON = time.toJSON();
  return new ical.Time({
      year: timeJSON['year'],
      month: timeJSON['month'],
      day: timeJSON['day'],
      isDate: true,
  }, time.zone);
}
