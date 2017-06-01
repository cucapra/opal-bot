import * as ical from 'ical.js';

/**
 * Generate all the Events in a calendar.
 */
function* get_events(jcal: any): Iterable<ical.Event> {
  let comp = new ical.Component(jcal);
  for (let vevent of comp.getAllSubcomponents('vevent')) {
    yield new ical.Event(vevent);
  }
}

/**
 * Get all the occurrences of a given Event in a time range. This works on
 * both repeating and non-repeating events: non-repeating events just have
 * a single "occurrence."
 */
function* get_event_ocurrences(event: ical.Event, start: ical.Time, end: ical.Time) {
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
