export class Component {
    constructor(jCal: any[]|string, parent?: Component);

    /**
    * Finds first sub component, optionally filtered by name.
    *
    * @param {string=} name        Optional name to filter by
    * @return {?Component}     The found subcomponent
    */
    getFirstSubcomponent(name?: string): Component;

    /**
    * Finds all sub components, optionally filtering by name.
    *
    * @param {string=} name            Optional name to filter by
    * @return {Component[]}       The found sub components
    */
    getAllSubcomponents(name?: string): Component[];

    /**
    * Returns true when a named property exists.
    *
    * @param {string} name     The property name
    * @return {boolean}        True, when property is found
    */
    hasProperty(name: string): boolean;

    /**
    * Finds the first property, optionally with the given name.
    *
    * @param {string=} name        Lowercase property name
    * @return {?Property}     The found property
    */
    getFirstProperty(name?: string): Property;

    /**
    * Returns first property's value, if available.
    *
    * @param {string=} name    Lowercase property name
    * @return {?string}        The found property value.
    */
    getFirstPropertyValue(name?: string): string;

    /**
    * Get all properties in the component, optionally filtered by name.
    *
    * @param {string=} name        Lowercase property name
    * @return {Property[]}    List of properties
    */
    getAllProperties(name?: string): Property[];

    /**
    * Adds a single sub component.
    *
    * @param {Component} component        The component to add
    * @return {Component}                 The passed in component
    */
    addSubcomponent(component: Component): Component;

    /**
    * Removes a single component by name or the instance of a specific
    * component.
    *
    * @param {Component|string} nameOrComp    Name of component, or component
    * @return {boolean}                            True when comp is removed
    */
    removeSubcomponent(nameOrComp: (Component|string)): boolean;

    /**
    * Removes all components or (if given) all components by a particular
    * name.
    *
    * @param {string=} name            Lowercase component name
    */
    removeAllSubcomponents(name?: string): void;

    /**
    * Adds an {@link Property} to the component.
    *
    * @param {Property} property      The property to add
    * @return {Property}              The passed in property
    */
    addProperty(property: Property): Property;

    /**
    * Helper method to add a property with a value to the component.
    *
    * @param {string}               name         Property name to add
    * @param {string|number|Object} value        Property value
    * @return {Property}                    The created property
    */
    addPropertyWithValue(name: string, value: (string|number|Object)): Property;

    /**
    * Helper method that will update or create a property of the given name
    * and sets its value. If multiple properties with the given name exist,
    * only the first is updated.
    *
    * @param {string}               name         Property name to update
    * @param {string|number|Object} value        Property value
    * @return {Property}                    The created property
    */
    updatePropertyWithValue(name: string, value: (string|number|Object)): Property;

    /**
    * Removes a single property by name or the instance of the specific
    * property.
    *
    * @param {string|Property} nameOrProp     Property name or instance to remove
    * @return {boolean}                            True, when deleted
    */
    removeProperty(nameOrProp: (string|Property)): boolean;

    /**
    * Removes all properties associated with this component, optionally
    * filtered by name.
    *
    * @param {string=} name        Lowercase property name
    * @return {boolean}            True, when deleted
    */
    removeAllProperties(name?: string): boolean;

    /**
    * Returns the Object representation of this component. The returned object
    * is a live jCal object and should be cloned if modified.
    * @return {Object}
    */
    toJSON(): Object;

    /**
    * The string representation of this component.
    * @return {string}
    */
    toString(): string;

    /**
    * Create an {@link Component} by parsing the passed iCalendar string.
    *
    * @param {string} str        The iCalendar string to parse
    */
    static fromString(str: string): void;

}

/**
* @classdesc
* This class represents the "duration" value type, with various calculation
* and manipulation methods.
*
* @class
* @alias Duration
* @param {Object} data               An object with members of the duration
* @param {number} data.weeks         Duration in weeks
* @param {number} data.days          Duration in days
* @param {number} data.hours         Duration in hours
* @param {number} data.minutes       Duration in minutes
* @param {number} data.seconds       Duration in seconds
* @param {boolean} data.isNegative   If true, the duration is negative
*/
export class Duration {
    /**
    * @classdesc
    * This class represents the "duration" value type, with various calculation
    * and manipulation methods.
    *
    * @class
    * @alias Duration
    * @param {Object} data               An object with members of the duration
    * @param {number} data.weeks         Duration in weeks
    * @param {number} data.days          Duration in days
    * @param {number} data.hours         Duration in hours
    * @param {number} data.minutes       Duration in minutes
    * @param {number} data.seconds       Duration in seconds
    * @param {boolean} data.isNegative   If true, the duration is negative
    */
    constructor(data: { weeks?: number, days?: number, hours?: number, minutes?: number, seconds?: number, isNegative?: boolean });

    /**
    * The weeks in this duration
    * @type {number}
    * @default 0
    */
    weeks: number;

    /**
    * The days in this duration
    * @type {number}
    * @default 0
    */
    days: number;

    /**
    * The days in this duration
    * @type {number}
    * @default 0
    */
    hours: number;

    /**
    * The minutes in this duration
    * @type {number}
    * @default 0
    */
    minutes: number;

    /**
    * The seconds in this duration
    * @type {number}
    * @default 0
    */
    seconds: number;

    /**
    * The seconds in this duration
    * @type {boolean}
    * @default false
    */
    isNegative: boolean;

    /**
    * The class identifier.
    * @constant
    * @type {string}
    * @default "icalduration"
    */
    icalclass: string;

    /**
    * The type name, to be used in the jCal object.
    * @constant
    * @type {string}
    * @default "duration"
    */
    icaltype: string;

    /**
    * Returns a clone of the duration object.
    *
    * @return {Duration}      The cloned object
    */
    clone(): Duration;

    /**
    * The duration value expressed as a number of seconds.
    *
    * @return {number}             The duration value in seconds
    */
    toSeconds(): number;

    /**
    * Reads the passed seconds value into this duration object. Afterwards,
    * members like {@link Duration#days days} and {@link Duration#weeks weeks} will be set up
    * accordingly.
    *
    * @param {number} aSeconds     The duration value in seconds
    * @return {Duration}      Returns this instance
    */
    fromSeconds(aSeconds: number): Duration;

    /**
    * Sets up the current instance using members from the passed data object.
    *
    * @param {Object} aData               An object with members of the duration
    * @param {number} aData.weeks         Duration in weeks
    * @param {number} aData.days          Duration in days
    * @param {number} aData.hours         Duration in hours
    * @param {number} aData.minutes       Duration in minutes
    * @param {number} aData.seconds       Duration in seconds
    * @param {boolean} aData.isNegative   If true, the duration is negative
    */
    fromData(aData: { weeks: number, days: number, hours: number, minutes: number, seconds: number, isNegative: boolean }): void;

    /**
    * Resets the duration instance to the default values, i.e. PT0S
    */
    reset(): void;

    /**
    * Compares the duration instance with another one.
    *
    * @param {Duration} aOther        The instance to compare with
    * @return {number}                     -1, 0 or 1 for less/equal/greater
    */
    compare(aOther: Duration): number;

    /**
    * Normalizes the duration instance. For example, a duration with a value
    * of 61 seconds will be normalized to 1 minute and 1 second.
    */
    normalize(): void;

    /**
    * The string representation of this duration.
    * @return {string}
    */
    toString(): string;

    /**
    * The iCalendar string representation of this duration.
    * @return {string}
    */
    toICALstring(): string;

    /**
    * Returns a new Duration instance from the passed seconds value.
    *
    * @param {number} aSeconds       The seconds to create the instance from
    * @return {Duration}        The newly created duration instance
    */
    static fromSeconds(aSeconds: number): Duration;

    /**
    * Checks if the given string is an iCalendar duration value.
    *
    * @param {string} value      The raw ical value
    * @return {boolean}          True, if the given value is of the
    *                              duration ical type
    */
    static isValuestring(value: string): boolean;

    /**
    * Creates a new {@link Duration} instance from the passed string.
    *
    * @param {string} aStr       The string to parse
    * @return {Duration}    The created duration instance
    */
    static fromString(aStr: string): Duration;

    /**
    * Creates a new Duration instance from the given data object.
    *
    * @param {Object} aData               An object with members of the duration
    * @param {number} aData.weeks         Duration in weeks
    * @param {number} aData.days          Duration in days
    * @param {number} aData.hours         Duration in hours
    * @param {number} aData.minutes       Duration in minutes
    * @param {number} aData.seconds       Duration in seconds
    * @param {boolean} aData.isNegative   If true, the duration is negative
    * @return {Duration}             The createad duration instance
    */
    static fromData(aData: { weeks: number, days: number, hours: number, minutes: number, seconds: number, isNegative: boolean }): Duration;

}

/**
* js is organized into multiple layers. The bottom layer is a raw jCal
* object, followed by the component/property layer. The highest level is the
* event representation, which this class is part of. See the
* {@tutorial layers} guide for more details.
*
* @class
* @alias Event
* @param {Component=} component         The Component to base this event on
* @param {Object} options                    Options for this event
* @param {boolean} options.strictExceptions
*          When true, will verify exceptions are related by their UUID
* @param {Array<Component|Event>} options.exceptions
*          Exceptions to this event, either as components or events
*/
export class Event {
    /**
    * @classdesc
    * js is organized into multiple layers. The bottom layer is a raw jCal
    * object, followed by the component/property layer. The highest level is the
    * event representation, which this class is part of. See the
    * {@tutorial layers} guide for more details.
    *
    * @class
    * @alias Event
    * @param {Component=} component         The Component to base this event on
    * @param {Object} options                    Options for this event
    * @param {boolean} options.strictExceptions
    *          When true, will verify exceptions are related by their UUID
    * @param {Array<Component|Event>} options.exceptions
    *          Exceptions to this event, either as components or events
    */
    constructor(component?: Component, options?: { strictExceptions: boolean, exceptions: (Component|Event)[] });

    /**
    * List of related event exceptions.
    *
    * @type {Event[]}
    */
    exceptions: Event[];

    /**
    * When true, will verify exceptions are related by their UUID.
    *
    * @type {boolean}
    */
    strictExceptions: boolean;

    /**
    * Relates a given event exception to this object.  If the given component
    * does not share the UID of this event it cannot be related and will throw
    * an exception.
    *
    * If this component is an exception it cannot have other exceptions
    * related to it.
    *
    * @param {Component|Event} obj       Component or event
    */
    relateException(obj: (Component|Event)): void;

    /**
    * Checks if this record is an exception and has the RANGE=THISANDFUTURE
    * value.
    *
    * @return {boolean}        True, when exception is within range
    */
    modifiesFuture(): boolean;

    /**
    * Finds the range exception nearest to the given date.
    *
    * @param {Time} time usually an occurrence time of an event
    * @return {?Event} the related event/exception or null
    */
    findRangeException(time: Time): Event;


    /**
    * Returns the occurrence details based on its start time.  If the
    * occurrence has an exception will return the details for that exception.
    *
    * NOTE: this method is intend to be used in conjunction
    *       with the {@link Event#iterator iterator} method.
    *
    * @param {Time} occurrence time occurrence
    * @return {OccurrenceDetails} Information about the occurrence
    */
    getOccurrenceDetails(occurrence: Time): OccurrenceDetails;

    /**
    * Builds a recur expansion instance for a specific point in time (defaults
    * to startDate).
    *
    * @param {Time} startTime     Starting point for expansion
    * @return {RecurExpansion}    Expansion object
    */
    iterator(startTime?: Time): RecurExpansion;

    /**
    * Checks if the event is recurring
    *
    * @return {boolean}        True, if event is recurring
    */
    isRecurring(): boolean;

    /**
    * Checks if the event describes a recurrence exception. See
    * {@tutorial terminology} for details.
    *
    * @return {boolean}    True, if the even describes a recurrence exception
    */
    isRecurrenceException(): boolean;

    /**
    * Returns the types of recurrences this event may have.
    *
    * Returned as an object with the following possible keys:
    *
    *    - YEARLY
    *    - MONTHLY
    *    - WEEKLY
    *    - DAILY
    *    - MINUTELY
    *    - SECONDLY
    *
    * @return {Object.<Recur.frequencyValues, boolean>}
    *          Object of recurrence flags
    */
    getRecurrenceTypes(): { [k: string]: boolean };

    /**
    * The uid of this event
    * @type {string}
    */
    uid: string;

    /**
    * The start date
    * @type {Time}
    */
    startDate: Time;

    /**
    * The end date. This can be the result directly from the property, or the
    * end date calculated from start date and duration.
    * @type {Time}
    */
    endDate: Time;

    /**
    * The duration. This can be the result directly from the property, or the
    * duration calculated from start date and end date.
    * @type {Duration}
    * @readonly
    */
    duration: Duration;

    /**
    * The location of the event.
    * @type {string}
    */
    location: string;

    /**
    * The attendees in the event
    * @type {Property[]}
    * @readonly
    */
    attendees: Property[];

    /**
    * The event summary
    * @type {string}
    */
    summary: string;

    /**
    * The event description.
    * @type {string}
    */
    description: string;

    /**
    * The organizer value as an uri. In most cases this is a mailto: uri, but
    * it can also be something else, like urn:uuid:...
    * @type {string}
    */
    organizer: string;

    /**
    * The sequence value for this event. Used for scheduling
    * see {@tutorial terminology}.
    * @type {number}
    */
    sequence: number;

    /**
    * The recurrence id for this event. See {@tutorial terminology} for details.
    * @type {Time}
    */
    recurrenceId: Time;

    /**
    * Set/update a time property's value.
    * This will also update the TZID of the property.
    *
    * TODO: this method handles the case where we are switching
    * from a known timezone to an implied timezone (one without TZID).
    * This does _not_ handle the case of moving between a known
    *  (by TimezoneService) timezone to an unknown timezone...
    *
    * We will not add/remove/update the VTIMEZONE subcomponents
    *  leading to invalid ICAL data...
    * @private
    * @param {string} propName     The property name
    * @param {Time} time      The time to set
    */
    private _setTime(propName: string, time: Time): void;

    /**
    * The string representation of this event.
    * @return {string}
    */
    toString(): string;

}

export interface OccurrenceDetails {
    recurrenceId: Time;
    item: Event;
    startDate: Time;
    endDate: Time;
}

/**
* Helper functions used in various places within js
* @namespace
*/
declare module helpers {
    /**
    * Checks if the given type is of the number type and also NaN.
    *
    * @param {number} number     The number to check
    * @return {boolean}          True, if the number is strictly NaN
    */
    function isStrictlyNaN(number: number): boolean;

    /**
    * Parses a string value that is expected to be an integer, when the valid is
    * not an integer throws a decoration error.
    *
    * @param {string} string     Raw string input
    * @return {number}           Parsed integer
    */
    function strictParseInt(string: string): number;

    /**
    * Creates or returns a class instance of a given type with the initialization
    * data if the data is not already an instance of the given type.
    *
    * @example
    * var time = new Time(...);
    * var result = helpers.formatClassType(time, Time);
    *
    * (result instanceof Time)
    * // => true
    *
    * result = helpers.formatClassType({}, Time);
    * (result isntanceof Time)
    * // => true
    *
    *
    * @param {Object} data       object initialization data
    * @param {Object} type       object type (like Time)
    * @return {?}                An instance of the found type.
    */
    function formatClassType(data: Object, type: Object): any;

    /**
    * Identical to indexOf but will only match values when they are not preceded
    * by a backslash character.
    *
    * @param {string} buffer         string to search
    * @param {string} search         Value to look for
    * @param {number} pos            Start position
    * @return {number}               The position, or -1 if not found
    */
    function unescapedIndexOf(buffer: string, search: string, pos: number): number;

    /**
    * Find the index for insertion using binary search.
    *
    * @param {Array} list            The list to search
    * @param {?} seekVal             The value to insert
    * @param {function(?,?)} cmpfunc The comparison func, that can
    *                                  compare two seekVals
    * @return {number}               The insert position
    */
    function binsearchInsert<T>(list: T[], seekVal: T, cmpfunc: (() => any)): number;

    /**
    * Convenience function for debug output
    * @private
    */
    function dumpn(): void;

    /**
    * Clone the passed object or primitive. By default a shallow clone will be
    * executed.
    *
    * @param {*} aSrc            The thing to clone
    * @param {boolean=} aDeep    If true, a deep clone will be performed
    * @return {*}                The copy of the thing
    */
    function clone(aSrc: any, aDeep?: boolean): any;

    /**
    * Performs iCalendar line folding. A line ending character is inserted and
    * the next line begins with a whitespace.
    *
    * @example
    * SUMMARY:This line will be fold
    *  ed right in the middle of a word.
    *
    * @param {string} aLine      The line to fold
    * @return {string}           The folded line
    */
    function foldline(aLine: string): string;

    /**
    * Pads the given string or number with zeros so it will have at least two
    * characters.
    *
    * @param {string|number} data    The string or number to pad
    * @return {string}               The number padded as a string
    */
    function pad2(data: (string|number)): string;

    /**
    * Truncates the given number, correctly handling negative numbers.
    *
    * @param {number} number     The number to truncate
    * @return {number}           The truncated number
    */
    function trunc(number: number): number;

    /**
    * Poor-man's cross-browser inheritance for JavaScript. Doesn't support all
    * the features, but enough for our usage.
    *
    * @param {Function} base     The base class constructor function.
    * @param {Function} child    The child class constructor function.
    * @param {Object} extra      Extends the prototype with extra properties
    *                              and methods
    */
    function inherits(base: (() => any), child: (() => any), extra: Object): void;

    /**
    * Poor-man's cross-browser object extension. Doesn't support all the
    * features, but enough for our usage. Note that the target's properties are
    * not overwritten with the source properties.
    *
    * @example
    * var child = helpers.extend(parent, {
    *   "bar": 123
    * });
    *
    * @param {Object} source     The object to extend
    * @param {Object} target     The object to extend with
    * @return {Object}           Returns the target.
    */
    function extend(source: Object, target: Object): Object;

}

/**
* Parses iCalendar or vCard data into a raw jCal object. Consult
* documentation on the {@tutorial layers|layers of parsing} for more
* details.
*
* @function parse
* @variation function
* @todo Fix the API to be more clear on the return type
* @param {string} input      The string data to parse
* @return {Object|Object[]}  A single jCal object, or an array thereof
*/
export function parse(input: string): (Object|Object[]);

/**
* @classdesc
* This class represents the "period" value type, with various calculation
* and manipulation methods.
*
* @description
* The passed data object cannot contain both and end date and a duration.
*
* @class
* @param {Object} aData                  An object with members of the period
* @param {Time=} aData.start        The start of the period
* @param {Time=} aData.end          The end of the period
* @param {Duration=} aData.duration The duration of the period
*/
export class Period {
    /**
    * @classdesc
    * This class represents the "period" value type, with various calculation
    * and manipulation methods.
    *
    * @description
    * The passed data object cannot contain both and end date and a duration.
    *
    * @class
    * @param {Object} aData                  An object with members of the period
    * @param {Time=} aData.start        The start of the period
    * @param {Time=} aData.end          The end of the period
    * @param {Duration=} aData.duration The duration of the period
    */
    constructor(aData: { start: Time, end: Time, duration: Duration });

    /**
    * The start of the period
    * @type {Time}
    */
    start: Time;

    /**
    * The end of the period
    * @type {Time}
    */
    end: Time;

    /**
    * The duration of the period
    * @type {Duration}
    */
    duration: Duration;

    /**
    * The class identifier.
    * @constant
    * @type {string}
    * @default "icalperiod"
    */
    icalclass: string;

    /**
    * The type name, to be used in the jCal object.
    * @constant
    * @type {string}
    * @default "period"
    */
    icaltype: string;

    /**
    * Returns a clone of the duration object.
    *
    * @return {Period}      The cloned object
    */
    clone(): Period;

    /**
    * Calculates the duration of the period, either directly or by subtracting
    * start from end date.
    *
    * @return {Duration}      The calculated duration
    */
    getDuration(): Duration;

    /**
    * Calculates the end date of the period, either directly or by adding
    * duration to start date.
    *
    * @return {Time}          The calculated end date
    */
    getEnd(): Time;

    /**
    * The string representation of this period.
    * @return {string}
    */
    toString(): string;

    /**
    * The jCal representation of this period type.
    * @return {Object}
    */
    toJSON(): Object;

    /**
    * The iCalendar string representation of this period.
    * @return {string}
    */
    toICALstring(): string;

    /**
    * Creates a new {@link Period} instance from the passed string.
    *
    * @param {string} str            The string to parse
    * @param {Property} prop    The property this period will be on
    * @return {Period}          The created period instance
    */
    static fromString(str: string, prop: Property): Period;

    /**
    * Creates a new {@link Period} instance from the given data object.
    * The passed data object cannot contain both and end date and a duration.
    *
    * @param {Object} aData                  An object with members of the period
    * @param {Time=} aData.start        The start of the period
    * @param {Time=} aData.end          The end of the period
    * @param {Duration=} aData.duration The duration of the period
    * @return {Period}                  The period instance
    */
    static fromData(aData: { start: Time, end: Time, duration: Duration }): Period;

    /**
    * Returns a new period instance from the given jCal data array. The first
    * member is always the start date string, the second member is either a
    * duration or end date string.
    *
    * @param {Array<string,string>} aData    The jCal data array
    * @param {Property} aProp           The property this jCal data is on
    * @return {Period}                  The period instance
    */
    static fromJSON(aData: [string, string][], aProp: Property): Period;

}

/**
* @classdesc
* Provides a layer on top of the raw jCal object for manipulating a single
* property, with its parameters and value.
*
* @description
* Its important to note that mutations done in the wrapper
* directly mutate the jCal object used to initialize.
*
* Can also be used to create new properties by passing
* the name of the property (as a string).
*
* @class
* @alias Property
* @param {Array|string} jCal         Raw jCal representation OR
*  the new name of the property
*
* @param {Component=} parent    Parent component
*/
export class Property {
    /**
    * @classdesc
    * Provides a layer on top of the raw jCal object for manipulating a single
    * property, with its parameters and value.
    *
    * @description
    * Its important to note that mutations done in the wrapper
    * directly mutate the jCal object used to initialize.
    *
    * Can also be used to create new properties by passing
    * the name of the property (as a string).
    *
    * @class
    * @alias Property
    * @param {Array|string} jCal         Raw jCal representation OR
    *  the new name of the property
    *
    * @param {Component=} parent    Parent component
    */
    constructor(jCal: any[]|string, parent?: Component);

    /**
    * The value type for this property
    * @readonly
    * @type {string}
    */
    type: string;

    /**
    * The name of this property, in lowercase.
    * @readonly
    * @type {string}
    */
    name: string;

    /**
    * The parent component for this property.
    * @type {Component}
    */
    parent: Component;

    /**
    * Gets a parameter on the property.
    *
    * @param {string}        name   Property name (lowercase)
    * @return {Array|string}        Property value
    */
    getParameter(name: string): (any[]|string);

    /**
    * Sets a parameter on the property.
    *
    * @param {string}       name     The parameter name
    * @param {Array|string} value    The parameter value
    */
    setParameter(name: string, value: (any[]|string)): void;

    /**
    * Removes a parameter
    *
    * @param {string} name     The parameter name
    */
    removeParameter(name: string): void;

    /**
    * Get the default type based on this property's name.
    *
    * @return {string}     The default type for this property
    */
    getDefaultType(): string;

    /**
    * Sets type of property and clears out any existing values of the current
    * type.
    *
    * @param {string} type     New iCAL type (see design.*.values)
    */
    resetType(type: string): void;

    /**
    * Finds the first property value.
    *
    * @return {string}         First property value
    */
    getFirstValue(): string;

    /**
    * Gets all values on the property.
    *
    * NOTE: this creates an array during each call.
    *
    * @return {Array}          List of values
    */
    getValues(): any[];

    /**
    * Removes all values from this property
    */
    removeAllValues(): void;

    /**
    * Sets the values of the property.  Will overwrite the existing values.
    * This can only be used for multi-value properties.
    *
    * @param {Array} values    An array of values
    */
    setValues(values: any[]): void;

    /**
    * Sets the current value of the property. If this is a multi-value
    * property, all other values will be removed.
    *
    * @param {string|Object} value     New property value.
    */
    setValue(value: (string|Object)): void;

    /**
    * Returns the Object representation of this component. The returned object
    * is a live jCal object and should be cloned if modified.
    * @return {Object}
    */
    toJSON(): Object;

    /**
    * The string representation of this component.
    * @return {string}
    */
    toICALstring(): string;

    /**
    * Create an {@link Property} by parsing the passed iCalendar string.
    *
    * @param {string} str                        The iCalendar string to parse
    * @param {design.designSet=} designSet  The design data to use for this property
    * @return {Property}                    The created iCalendar property
    */
    static fromString(str: string, designSet?: any): Property;

}

/**
* @classdesc
* This class represents the "recur" value type, with various calculation
* and manipulation methods.
*
* @class
* @alias Recur
* @param {Object} data                       An object with members of the recurrence
* @param {frequencyValues} freq   The frequency value
* @param {number=} data.interval             The INTERVAL value
* @param {weekDay=} data.wkst      The week start value
* @param {Time=} data.until             The end of the recurrence set
* @param {number=} data.count                The number of occurrences
* @param {Array.<number>=} data.bysecond     The seconds for the BYSECOND part
* @param {Array.<number>=} data.byminute     The minutes for the BYMINUTE part
* @param {Array.<number>=} data.byhour       The hours for the BYHOUR part
* @param {Array.<string>=} data.byday        The BYDAY values
* @param {Array.<number>=} data.bymonthday   The days for the BYMONTHDAY part
* @param {Array.<number>=} data.byyearday    The days for the BYYEARDAY part
* @param {Array.<number>=} data.byweekno     The weeks for the BYWEEKNO part
* @param {Array.<number>=} data.bymonth      The month for the BYMONTH part
* @param {Array.<number>=} data.bysetpos     The positionals for the BYSETPOS part
*/
export class Recur {
    /**
    * @classdesc
    * This class represents the "recur" value type, with various calculation
    * and manipulation methods.
    *
    * @class
    * @alias Recur
    * @param {Object} data                       An object with members of the recurrence
    * @param {frequencyValues} freq   The frequency value
    * @param {number=} data.interval             The INTERVAL value
    * @param {weekDay=} data.wkst      The week start value
    * @param {Time=} data.until             The end of the recurrence set
    * @param {number=} data.count                The number of occurrences
    * @param {Array.<number>=} data.bysecond     The seconds for the BYSECOND part
    * @param {Array.<number>=} data.byminute     The minutes for the BYMINUTE part
    * @param {Array.<number>=} data.byhour       The hours for the BYHOUR part
    * @param {Array.<string>=} data.byday        The BYDAY values
    * @param {Array.<number>=} data.bymonthday   The days for the BYMONTHDAY part
    * @param {Array.<number>=} data.byyearday    The days for the BYYEARDAY part
    * @param {Array.<number>=} data.byweekno     The weeks for the BYWEEKNO part
    * @param {Array.<number>=} data.bymonth      The month for the BYMONTH part
    * @param {Array.<number>=} data.bysetpos     The positionals for the BYSETPOS part
    */
    constructor(data: { interval: number, wkst: weekDay, until: Time, count: number, bysecond: number[], byminute: number[], byhour: number[], byday: string[], bymonthday: number[], byyearday: number[], byweekno: number[], bymonth: number[], bysetpos: number[] }, freq: frequencyValues);

    /**
    * An object holding the BY-parts of the recurrence rule
    * @type {Object}
    */
    parts: Object;

    /**
    * The interval value for the recurrence rule.
    * @type {number}
    */
    interval: number;

    /**
    * The week start day
    *
    * @type {weekDay}
    * @default Time.MONDAY
    */
    wkst: weekDay;

    /**
    * The end of the recurrence
    * @type {?Time}
    */
    until: Time;

    /**
    * The maximum number of occurrences
    * @type {?number}
    */
    count: number;

    /**
    * The frequency value.
    * @type {Recur.frequencyValues}
    */
    freq: frequencyValues;

    /**
    * The class identifier.
    * @constant
    * @type {string}
    * @default "icalrecur"
    */
    icalclass: string;

    /**
    * The type name, to be used in the jCal object.
    * @constant
    * @type {string}
    * @default "recur"
    */
    icaltype: string;

    /**
    * Create a new iterator for this recurrence rule. The passed start date
    * must be the start date of the event, not the start of the range to
    * search in.
    *
    * @example
    * var recur = comp.getFirstPropertyValue('rrule');
    * var dtstart = comp.getFirstPropertyValue('dtstart');
    * var iter = recur.iterator(dtstart);
    * for (var next = iter.next(); next; next = iter.next()) {
    *   if (next.compare(rangeStart) < 0) {
    *     continue;
    *   }
    *   console.log(next.toString());
    * }
    *
    * @param {Time} aStart        The item's start date
    * @return {RecurIterator}     The recurrence iterator
    */
    iterator(aStart: Time): RecurIterator;

    /**
    * Returns a clone of the recurrence object.
    *
    * @return {Recur}      The cloned object
    */
    clone(): Recur;

    /**
    * Checks if the current rule is finite, i.e. has a count or until part.
    *
    * @return {boolean}        True, if the rule is finite
    */
    isFinite(): boolean;

    /**
    * Checks if the current rule has a count part, and not limited by an until
    * part.
    *
    * @return {boolean}        True, if the rule is by count
    */
    isByCount(): boolean;

    /**
    * Adds a component (part) to the recurrence rule. This is not a component
    * in the sense of {@link Component}, but a part of the recurrence
    * rule, i.e. BYMONTH.
    *
    * @param {string} aType            The name of the component part
    * @param {Array|string} aValue     The component value
    */
    addComponent(aType: string, aValue: (any[]|string)): void;

    /**
    * Sets the component value for the given by-part.
    *
    * @param {string} aType        The component part name
    * @param {Array} aValues       The component values
    */
    setComponent(aType: string, aValues: any[]): void;

    /**
    * Gets (a copy) of the requested component value.
    *
    * @param {string} aType        The component part name
    * @return {Array}              The component part value
    */
    getComponent(aType: string): any[];

    /**
    * Retrieves the next occurrence after the given recurrence id. See the
    * guide on {@tutorial terminology} for more details.
    *
    * NOTE: Currently, this method iterates all occurrences from the start
    * date. It should not be called in a loop for performance reasons. If you
    * would like to get more than one occurrence, you can iterate the
    * occurrences manually, see the example on the
    * {@link Recur#iterator iterator} method.
    *
    * @param {Time} aStartTime        The start of the event series
    * @param {Time} aRecurrenceId     The date of the last occurrence
    * @return {Time}                  The next occurrence after
    */
    getNextOccurrence(aStartTime: Time, aRecurrenceId: Time): Time;

    /**
    * Sets up the current instance using members from the passed data object.
    *
    * @param {Object} data                       An object with members of the recurrence
    * @param {Recur.frequencyValues} freq   The frequency value
    * @param {number=} data.interval             The INTERVAL value
    * @param {weekDay=} data.wkst      The week start value
    * @param {Time=} data.until             The end of the recurrence set
    * @param {number=} data.count                The number of occurrences
    * @param {Array.<number>=} data.bysecond     The seconds for the BYSECOND part
    * @param {Array.<number>=} data.byminute     The minutes for the BYMINUTE part
    * @param {Array.<number>=} data.byhour       The hours for the BYHOUR part
    * @param {Array.<string>=} data.byday        The BYDAY values
    * @param {Array.<number>=} data.bymonthday   The days for the BYMONTHDAY part
    * @param {Array.<number>=} data.byyearday    The days for the BYYEARDAY part
    * @param {Array.<number>=} data.byweekno     The weeks for the BYWEEKNO part
    * @param {Array.<number>=} data.bymonth      The month for the BYMONTH part
    * @param {Array.<number>=} data.bysetpos     The positionals for the BYSETPOS part
    */
    fromData(data: { interval: number, wkst: weekDay, until: Time, count: number, bysecond: number[], byminute: number[], byhour: number[], byday: string[], bymonthday: number[], byyearday: number[], byweekno: number[], bymonth: number[], bysetpos: number[] }, freq: frequencyValues): void;

    /**
    * The jCal representation of this recurrence type.
    * @return {Object}
    */
    toJSON(): Object;

    /**
    * The string representation of this recurrence rule.
    * @return {string}
    */
    toString(): string;

    /**
    * Convert an ical representation of a day (SU, MO, etc..)
    * into a numeric value of that day.
    *
    * @param {string} string     The iCalendar day name
    * @return {number}           Numeric value of given day
    */
    static icalDayToNumericDay(string: string): number;

    /**
    * Convert a numeric day value into its ical representation (SU, MO, etc..)
    *
    * @param {number} num        Numeric value of given day
    * @return {string}           The ICAL day value, e.g SU,MO,...
    */
    static numericDayToIcalDay(num: number): string;

    /**
    * Creates a new {@link Recur} instance from the passed string.
    *
    * @param {string} string         The string to parse
    * @return {Recur}           The created recurrence instance
    */
    static fromString(string: string): Recur;

    /**
    * Creates a new {@link Recur} instance using members from the passed
    * data object.
    *
    * @param {Object} aData                      An object with members of the recurrence
    * @param {frequencyValues} freq   The frequency value
    * @param {number=} aData.interval            The INTERVAL value
    * @param {weekDay=} aData.wkst     The week start value
    * @param {Time=} aData.until            The end of the recurrence set
    * @param {number=} aData.count               The number of occurrences
    * @param {Array.<number>=} aData.bysecond    The seconds for the BYSECOND part
    * @param {Array.<number>=} aData.byminute    The minutes for the BYMINUTE part
    * @param {Array.<number>=} aData.byhour      The hours for the BYHOUR part
    * @param {Array.<string>=} aData.byday       The BYDAY values
    * @param {Array.<number>=} aData.bymonthday  The days for the BYMONTHDAY part
    * @param {Array.<number>=} aData.byyearday   The days for the BYYEARDAY part
    * @param {Array.<number>=} aData.byweekno    The weeks for the BYWEEKNO part
    * @param {Array.<number>=} aData.bymonth     The month for the BYMONTH part
    * @param {Array.<number>=} aData.bysetpos    The positionals for the BYSETPOS part
    */
    static fromData(aData: { interval: number, wkst: weekDay, until: Time, count: number, bysecond: number[], byminute: number[], byhour: number[], byday: string[], bymonthday: number[], byyearday: number[], byweekno: number[], bymonth: number[], bysetpos: number[] }, freq: frequencyValues): void;

    /**
    * Converts a recurrence string to a data object, suitable for the fromData
    * method.
    *
    * @param {string} string     The string to parse
    * @param {boolean} fmtIcal   If true, the string is considered to be an
    *                              iCalendar string
    * @return {Recur}       The recurrence instance
    */
    static _stringToData(string: string, fmtIcal: boolean): Recur;

}

/**
* Possible frequency values for the FREQ part
* (YEARLY, MONTHLY, WEEKLY, DAILY, HOURLY, MINUTELY, SECONDLY)
*
* @typedef {string} frequencyValues
* @memberof Recur
*/
type frequencyValues = string;

/**
* @classdesc
* Primary class for expanding recurring rules.  Can take multiple rrules,
* rdates, exdate(s) and iterate (in order) over each next occurrence.
*
* Once initialized this class can also be serialized saved and continue
* iteration from the last point.
*
* NOTE: it is intended that this class is to be used
*       with Event which handles recurrence exceptions.
*
* @example
* // assuming event is a parsed ical component
* var event;
*
* var expand = new RecurExpansion({
*   component: event,
*   dtstart: event.getFirstPropertyValue('dtstart')
* });
*
* // remember there are infinite rules
* // so its a good idea to limit the scope
* // of the iterations then resume later on.
*
* // next is always an Time or null
* var next;
*
* while (someCondition && (next = expand.next())) {
*   // do something with next
* }
*
* // save instance for later
* var json = JSON.stringify(expand);
*
* //...
*
* // NOTE: if the component's properties have
* //       changed you will need to rebuild the
* //       class and start over. This only works
* //       when the component's recurrence info is the same.
* var expand = new RecurExpansion(JSON.parse(json));
*
* @description
* The options object can be filled with the specified initial values. It can
* also contain additional members, as a result of serializing a previous
* expansion state, as shown in the example.
*
* @class
* @alias RecurExpansion
* @param {Object} options
*        Recurrence expansion options
* @param {Time} options.dtstart
*        Start time of the event
* @param {Component=} options.component
*        Component for expansion, required if not resuming.
*/
export class RecurExpansion {
    /**
    * @classdesc
    * Primary class for expanding recurring rules.  Can take multiple rrules,
    * rdates, exdate(s) and iterate (in order) over each next occurrence.
    *
    * Once initialized this class can also be serialized saved and continue
    * iteration from the last point.
    *
    * NOTE: it is intended that this class is to be used
    *       with Event which handles recurrence exceptions.
    *
    * @example
    * // assuming event is a parsed ical component
    * var event;
    *
    * var expand = new RecurExpansion({
    *   component: event,
    *   dtstart: event.getFirstPropertyValue('dtstart')
    * });
    *
    * // remember there are infinite rules
    * // so its a good idea to limit the scope
    * // of the iterations then resume later on.
    *
    * // next is always an Time or null
    * var next;
    *
    * while (someCondition && (next = expand.next())) {
    *   // do something with next
    * }
    *
    * // save instance for later
    * var json = JSON.stringify(expand);
    *
    * //...
    *
    * // NOTE: if the component's properties have
    * //       changed you will need to rebuild the
    * //       class and start over. This only works
    * //       when the component's recurrence info is the same.
    * var expand = new RecurExpansion(JSON.parse(json));
    *
    * @description
    * The options object can be filled with the specified initial values. It can
    * also contain additional members, as a result of serializing a previous
    * expansion state, as shown in the example.
    *
    * @class
    * @alias RecurExpansion
    * @param {Object} options
    *        Recurrence expansion options
    * @param {Time} options.dtstart
    *        Start time of the event
    * @param {Component=} options.component
    *        Component for expansion, required if not resuming.
    */
    constructor(options: { dtstart: Time, component: Component });

    /**
    * True when iteration is fully completed.
    * @type {boolean}
    */
    complete: boolean;

    /**
    * Array of rrule iterators.
    *
    * @type {RecurIterator[]}
    * @private
    */
    private ruleIterators: RecurIterator[];

    /**
    * Array of rdate instances.
    *
    * @type {Time[]}
    * @private
    */
    private ruleDates: Time[];

    /**
    * Array of exdate instances.
    *
    * @type {Time[]}
    * @private
    */
    private exDates: Time[];

    /**
    * Current position in ruleDates array.
    * @type {number}
    * @private
    */
    private ruleDateInc: number;

    /**
    * Current position in exDates array
    * @type {number}
    * @private
    */
    private exDateInc: number;

    /**
    * Current negative date.
    *
    * @type {Time}
    * @private
    */
    private exDate: Time;

    /**
    * Current additional date.
    *
    * @type {Time}
    * @private
    */
    private ruleDate: Time;

    /**
    * Start date of recurring rules.
    *
    * @type {Time}
    */
    dtstart: Time;

    /**
    * Last expanded time
    *
    * @type {Time}
    */
    last: Time;

    /**
    * Initialize the recurrence expansion from the data object. The options
    * object may also contain additional members, see the
    * {@link RecurExpansion constructor} for more details.
    *
    * @param {Object} options
    *        Recurrence expansion options
    * @param {Time} options.dtstart
    *        Start time of the event
    * @param {Component=} options.component
    *        Component for expansion, required if not resuming.
    */
    fromData(options: { dtstart: Time, component: Component }): void;

    /**
    * Retrieve the next occurrence in the series.
    * @return {Time}
    */
    next(): Time;

    /**
    * Converts object into a serialize-able format. This format can be passed
    * back into the expansion to resume iteration.
    * @return {Object}
    */
    toJSON(): Object;

    /**
    * Extract all dates from the properties in the given component. The
    * properties will be filtered by the property name.
    *
    * @private
    * @param {Component} component        The component to search in
    * @param {string} propertyName             The property name to search for
    * @return {Time[]}                    The extracted dates.
    */
    private _extractDates(component: Component, propertyName: string): Time[];

    /**
    * Initialize the recurrence expansion.
    *
    * @private
    * @param {Component} component    The component to initialize from.
    */
    private _init(component: Component): void;

    /**
    * Advance to the next exdate
    * @private
    */
    private _nextExDay(): void;

    /**
    * Advance to the next rule date
    * @private
    */
    private _nextRuleDay(): void;

    /**
    * Find and return the recurrence rule with the most recent event and
    * return it.
    *
    * @private
    * @return {?RecurIterator}    Found iterator.
    */
    private _nextRecurrenceIter(): RecurIterator;

}

/**
* @classdesc
* An iterator for a single recurrence rule. This class usually doesn't have
* to be instanciated directly, the convenience method
* {@link Recur#iterator} can be used.
*
* @description
* The options object may contain additional members when resuming iteration from a previous run
*
* @description
* The options object may contain additional members when resuming iteration
* from a previous run.
*
* @class
* @alias RecurIterator
* @param {Object} options                The iterator options
* @param {Recur} options.rule       The rule to iterate.
* @param {Time} options.dtstart     The start date of the event.
* @param {boolean=} options.initialized  When true, assume that options are
*        from a previously constructed iterator. Initialization will not be
*        repeated.
*/
export class RecurIterator {
    /**
    * @classdesc
    * An iterator for a single recurrence rule. This class usually doesn't have
    * to be instanciated directly, the convenience method
    * {@link Recur#iterator} can be used.
    *
    * @description
    * The options object may contain additional members when resuming iteration from a previous run
    *
    * @description
    * The options object may contain additional members when resuming iteration
    * from a previous run.
    *
    * @class
    * @alias RecurIterator
    * @param {Object} options                The iterator options
    * @param {Recur} options.rule       The rule to iterate.
    * @param {Time} options.dtstart     The start date of the event.
    * @param {boolean=} options.initialized  When true, assume that options are
    *        from a previously constructed iterator. Initialization will not be
    *        repeated.
    */
    constructor(options: { rule: Recur, dtstart: Time, initialized: boolean });

    /**
    * True when iteration is finished.
    * @type {boolean}
    */
    completed: boolean;

    /**
    * The rule that is being iterated
    * @type {Recur}
    */
    rule: Recur;

    /**
    * The start date of the event being iterated.
    * @type {Time}
    */
    dtstart: Time;

    /**
    * The last occurrence that was returned from the
    * {@link RecurIterator#next} method.
    * @type {Time}
    */
    last: Time;

    /**
    * The sequence number from the occurrence
    * @type {number}
    */
    occurrence_number: number;

    /**
    * The indices used for the {@link RecurIterator#by_data} object.
    * @type {Object}
    * @private
    */
    private by_indices: Object;

    /**
    * If true, the iterator has already been initialized
    * @type {boolean}
    * @private
    */
    private initialized: boolean;

    /**
    * The initializd by-data.
    * @type {Object}
    * @private
    */
    private by_data: Object;

    /**
    * The expanded yeardays
    * @type {Array}
    * @private
    */
    private days: any[];

    /**
    * The index in the {@link RecurIterator#days} array.
    * @type {number}
    * @private
    */
    private days_index: number;

    /**
    * Initialize the recurrence iterator from the passed data object. This
    * method is usually not called directly, you can initialize the iterator
    * through the constructor.
    *
    * @param {Object} options                The iterator options
    * @param {Recur} options.rule       The rule to iterate.
    * @param {Time} options.dtstart     The start date of the event.
    * @param {boolean=} options.initialized  When true, assume that options are
    *        from a previously constructed iterator. Initialization will not be
    *        repeated.
    */
    fromData(options: { rule: Recur, dtstart: Time, initialized: boolean }): void;

    /**
    * Intialize the iterator
    * @private
    */
    private init(): void;

    /**
    * Retrieve the next occurrence from the iterator.
    * @return {Time}
    */
    next(): Time;

    /**
    * Normalize each by day rule for a given year/month.
    * Takes into account ordering and negative rules
    *
    * @private
    * @param {number} year         Current year.
    * @param {number} month        Current month.
    * @param {Array}  rules        Array of rules.
    *
    * @return {Array} sorted and normalized rules.
    *                 Negative rules will be expanded to their
    *                 correct positive values for easier processing.
    */
    private normalizeByMonthDayRules(year: number, month: number, rules: any[]): any[];

    /**
    * NOTES:
    * We are given a list of dates in the month (BYMONTHDAY) (23, etc..)
    * Also we are given a list of days (BYDAY) (MO, 2SU, etc..) when
    * both conditions match a given date (this.last.day) iteration stops.
    *
    * @private
    * @param {boolean=} isInit     When given true will not increment the
    *                                current day (this.last).
    */
    private _byDayAndMonthDay(isInit?: boolean): void;

    /**
    * Checks if given value is in BYSETPOS.
    *
    * @private
    * @param {Numeric} aPos position to check for.
    * @return {boolean} false unless BYSETPOS rules exist
    *                   and the given value is present in rules.
    */
    private check_set_position(aPos: number): boolean;

    /**
    * Convert iterator into a serialize-able object.  Will preserve current
    * iteration sequence to ensure the seamless continuation of the recurrence
    * rule.
    * @return {Object}
    */
    toJSON(): Object;

}

/**
* Convert a full jCal/jCard array into a iCalendar/vCard string.
*
* @function stringify
* @variation function
* @param {Array} jCal    The jCal/jCard document
* @return {string}       The stringified iCalendar/vCard document
*/
export function stringify(jCal: any[]): string;

/**
* @classdesc
* iCalendar Time representation (similar to JS Date object).  Fully
* independent of system (OS) timezone / time.  Unlike JS Date, the month
* January is 1, not zero.
*
* @example
* var time = new Time({
*   year: 2012,
*   month: 10,
*   day: 11
*   minute: 0,
*   second: 0,
*   isDate: false
* });
*
*
* @alias Time
* @class
* @param {Object} data           Time initialization
* @param {number=} data.year     The year for this date
* @param {number=} data.month    The month for this date
* @param {number=} data.day      The day for this date
* @param {number=} data.hour     The hour for this date
* @param {number=} data.minute   The minute for this date
* @param {number=} data.second   The second for this date
* @param {boolean=} data.isDate  If true, the instance represents a date (as
*                                  opposed to a date-time)
* @param {Timezone} zone timezone this position occurs in
*/
export class Time {
    /**
    * @classdesc
    * iCalendar Time representation (similar to JS Date object).  Fully
    * independent of system (OS) timezone / time.  Unlike JS Date, the month
    * January is 1, not zero.
    *
    * @example
    * var time = new Time({
    *   year: 2012,
    *   month: 10,
    *   day: 11
    *   minute: 0,
    *   second: 0,
    *   isDate: false
    * });
    *
    *
    * @alias Time
    * @class
    * @param {Object} data           Time initialization
    * @param {number=} data.year     The year for this date
    * @param {number=} data.month    The month for this date
    * @param {number=} data.day      The day for this date
    * @param {number=} data.hour     The hour for this date
    * @param {number=} data.minute   The minute for this date
    * @param {number=} data.second   The second for this date
    * @param {boolean=} data.isDate  If true, the instance represents a date (as
    *                                  opposed to a date-time)
    * @param {Timezone} zone timezone this position occurs in
    */
    constructor(data: { year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number, isDate?: boolean }, zone: Timezone);

    /**
    * The class identifier.
    * @constant
    * @type {string}
    * @default "icaltime"
    */
    icalclass: string;

    /**
    * The type name, to be used in the jCal object. This value may change and
    * is strictly defined by the {@link Time#isDate isDate} member.
    * @readonly
    * @type {string}
    * @default "date-time"
    */
    icaltype: string;

    /**
    * The timezone for this time.
    * @type {Timezone}
    */
    zone: Timezone;

    /**
    * Internal uses to indicate that a change has been made and the next read
    * operation must attempt to normalize the value (for example changing the
    * day to 33).
    *
    * @type {boolean}
    * @private
    */
    private _pendingNormalization: boolean;

    /**
    * Returns a clone of the time object.
    *
    * @return {Time}              The cloned object
    */
    clone(): Time;

    /**
    * Reset the time instance to epoch time
    */
    reset(): void;

    /**
    * Reset the time instance to the given date/time values.
    *
    * @param {number} year             The year to set
    * @param {number} month            The month to set
    * @param {number} day              The day to set
    * @param {number} hour             The hour to set
    * @param {number} minute           The minute to set
    * @param {number} second           The second to set
    * @param {Timezone} timezone  The timezone to set
    */
    resetTo(year: number, month: number, day: number, hour: number, minute: number, second: number, timezone: Timezone): void;

    /**
    * Set up the current instance from the Javascript date value.
    *
    * @param {?Date} aDate     The Javascript Date to read, or null to reset
    * @param {boolean} useUTC  If true, the UTC values of the date will be used
    */
    fromJSDate(aDate: Date | null, useUTC: boolean): void;

    /**
    * Sets up the current instance using members from the passed data object.
    *
    * @param {Object} aData            Time initialization
    * @param {number=} aData.year      The year for this date
    * @param {number=} aData.month     The month for this date
    * @param {number=} aData.day       The day for this date
    * @param {number=} aData.hour      The hour for this date
    * @param {number=} aData.minute    The minute for this date
    * @param {number=} aData.second    The second for this date
    * @param {boolean=} aData.isDate   If true, the instance represents a date
    *                                    (as opposed to a date-time)
    * @param {Timezone=} aZone    Timezone this position occurs in
    */
    fromData(aData: { year: number, month: number, day: number, hour: number, minute: number, second: number, isDate: boolean }, aZone?: Timezone): void;

    /**
    * Calculate the day of week.
    * @return {weekDay}
    */
    dayOfWeek(): weekDay;

    /**
    * Calculate the day of year.
    * @return {number}
    */
    dayOfYear(): number;

    /**
    * Returns a copy of the current date/time, rewound to the start of the
    * week. The resulting Time instance is of icaltype date, even if this
    * is a date-time.
    *
    * @param {weekDay=} aWeekStart
    *        The week start weekday, defaults to SUNDAY
    * @return {Time}      The start of the week (cloned)
    */
    startOfWeek(aWeekStart?: weekDay): Time;

    /**
    * Returns a copy of the current date/time, shifted to the end of the week.
    * The resulting Time instance is of icaltype date, even if this is a
    * date-time.
    *
    * @param {weekDay=} aWeekStart
    *        The week start weekday, defaults to SUNDAY
    * @return {Time}      The end of the week (cloned)
    */
    endOfWeek(aWeekStart?: weekDay): Time;

    /**
    * Returns a copy of the current date/time, rewound to the start of the
    * month. The resulting Time instance is of icaltype date, even if
    * this is a date-time.
    *
    * @return {Time}      The start of the month (cloned)
    */
    startOfMonth(): Time;

    /**
    * Returns a copy of the current date/time, shifted to the end of the
    * month.  The resulting Time instance is of icaltype date, even if
    * this is a date-time.
    *
    * @return {Time}      The end of the month (cloned)
    */
    endOfMonth(): Time;

    /**
    * Returns a copy of the current date/time, rewound to the start of the
    * year. The resulting Time instance is of icaltype date, even if
    * this is a date-time.
    *
    * @return {Time}      The start of the year (cloned)
    */
    startOfYear(): Time;

    /**
    * Returns a copy of the current date/time, shifted to the end of the
    * year.  The resulting Time instance is of icaltype date, even if
    * this is a date-time.
    *
    * @return {Time}      The end of the year (cloned)
    */
    endOfYear(): Time;

    /**
    * First calculates the start of the week, then returns the day of year for
    * this date. If the day falls into the previous year, the day is zero or negative.
    *
    * @param {weekDay=} aFirstDayOfWeek
    *        The week start weekday, defaults to SUNDAY
    * @return {number}     The calculated day of year
    */
    startDoyWeek(aFirstDayOfWeek?: weekDay): number;

    /**
    * Get the dominical letter for the current year. Letters range from A - G
    * for common years, and AG to GF for leap years.
    *
    * @param {number} yr           The year to retrieve the letter for
    * @return {string}             The dominical letter.
    */
    getDominicalLetter(yr: number): string;

    /**
    * Finds the nthWeekDay relative to the current month (not day).  The
    * returned value is a day relative the month that this month belongs to so
    * 1 would indicate the first of the month and 40 would indicate a day in
    * the following month.
    *
    * @param {number} aDayOfWeek   Day of the week see the day name constants
    * @param {number} aPos         Nth occurrence of a given week day values
    *        of 1 and 0 both indicate the first weekday of that type. aPos may
    *        be either positive or negative
    *
    * @return {number} numeric value indicating a day relative
    *                   to the current month of this time object
    */
    nthWeekDay(aDayOfWeek: number, aPos: number): number;

    /**
    * Checks if current time is the nth weekday, relative to the current
    * month.  Will always return false when rule resolves outside of current
    * month.
    *
    * @param {weekDay} aDayOfWeek       Day of week to check
    * @param {number} aPos                        Relative position
    * @return {boolean}                           True, if its the nth weekday
    */
    isNthWeekDay(aDayOfWeek: weekDay, aPos: number): boolean;

    /**
    * Calculates the ISO 8601 week number. The first week of a year is the
    * week that contains the first Thursday. The year can have 53 weeks, if
    * January 1st is a Friday.
    *
    * Note there are regions where the first week of the year is the one that
    * starts on January 1st, which may offset the week number. Also, if a
    * different week start is specified, this will also affect the week
    * number.
    *
    * @see Time.weekOneStarts
    * @param {weekDay} aWeekStart        The weekday the week starts with
    * @return {number}                             The ISO week number
    */
    weeknumber(aWeekStart: weekDay): number;

    /**
    * Adds the duration to the current time. The instance is modified in
    * place.
    *
    * @param {Duration} aDuration         The duration to add
    */
    addDuration(aDuration: Duration): void;

    /**
    * Subtract the date details (_excluding_ timezone).  Useful for finding
    * the relative difference between two time objects excluding their
    * timezone differences.
    *
    * @param {Time} aDate     The date to substract
    * @return {Duration}      The difference as a duration
    */
    subtractDate(aDate: Time): Duration;

    /**
    * Subtract the date details, taking timezones into account.
    *
    * @param {Time} aDate  The date to subtract
    * @return {Duration}  The difference in duration
    */
    subtractDateTz(aDate: Time): Duration;

    /**
    * Compares the Time instance with another one.
    *
    * @param {Time} aOther        The instance to compare with
    * @return {number}                     -1, 0 or 1 for less/equal/greater
    */
    compare(aOther: Time): number;

    /**
    * Compares only the date part of this instance with another one.
    *
    * @param {Time} other         The instance to compare with
    * @param {Timezone} tz            The timezone to compare in
    * @return {number}                     -1, 0 or 1 for less/equal/greater
    */
    compareDateOnlyTz(other: Time, tz: Timezone): number;

    /**
    * Convert the instance into another timzone. The returned Time
    * instance is always a copy.
    *
    * @param {Timezone} zone      The zone to convert to
    * @return {Time}              The copy, converted to the zone
    */
    convertToZone(zone: Timezone): Time;

    /**
    * Calculates the UTC offset of the current date/time in the timezone it is
    * in.
    *
    * @return {number}     UTC offset in seconds
    */
    utcOffset(): number;

    /**
    * Returns an RFC 5545 compliant ical representation of this object.
    *
    * @return {string} ical date/date-time
    */
    toICALstring(): string;

    /**
    * The string representation of this date/time, in jCal form
    * (including : and - separators).
    * @return {string}
    */
    toString(): string;

    /**
    * Converts the current instance to a Javascript date
    * @return {Date}
    */
    toJSDate(): Date;

    /**
    * Adjust the date/time by the given offset
    *
    * @param {number} aExtraDays       The extra amount of days
    * @param {number} aExtraHours      The extra amount of hours
    * @param {number} aExtraMinutes    The extra amount of minutes
    * @param {number} aExtraSeconds    The extra amount of seconds
    * @param {number=} aTime           The time to adjust, defaults to the
    *                                    current instance.
    */
    adjust(aExtraDays: number, aExtraHours: number, aExtraMinutes: number, aExtraSeconds: number, aTime?: number): void;

    /**
    * Sets up the current instance from unix time, the number of seconds since
    * January 1st, 1970.
    *
    * @param {number} seconds      The seconds to set up with
    */
    fromUnixTime(seconds: number): void;

    /**
    * Converts the current instance to seconds since January 1st 1970.
    *
    * @return {number}         Seconds since 1970
    */
    toUnixTime(): number;

    /**
    * Converts time to into Object which can be serialized then re-created
    * using the constructor.
    *
    * @example
    * // toJSON will automatically be called
    * var json = JSON.stringify(mytime);
    *
    * var deserialized = JSON.parse(json);
    *
    * var time = new Time(deserialized);
    *
    * @return {Object}
    */
    toJSON(): any;

    /**
    * Returns the days in the given month
    *
    * @param {number} month      The month to check
    * @param {number} year       The year to check
    * @return {number}           The number of days in the month
    */
    static daysInMonth(month: number, year: number): number;

    /**
    * Checks if the year is a leap year
    *
    * @param {number} year       The year to check
    * @return {boolean}          True, if the year is a leap year
    */
    static isLeapYear(year: number): boolean;

    /**
    * Create a new Time from the day of year and year. The date is returned
    * in floating timezone.
    *
    * @param {number} aDayOfYear     The day of year
    * @param {number} aYear          The year to create the instance in
    * @return {Time}            The created instance with the calculated date
    */
    static fromDayOfYear(aDayOfYear: number, aYear: number): Time;

    /**
    * Returns a new Time instance from a date string, e.g 2015-01-02.
    *
    * @deprecated                Use {@link Time.fromDatestring} instead
    * @param {string} str        The string to create from
    * @return {Time}        The date/time instance
    */
    static fromStringv2(str: string): Time;

    /**
    * Returns a new Time instance from a date string, e.g 2015-01-02.
    *
    * @param {string} aValue     The string to create from
    * @return {Time}        The date/time instance
    */
    static fromDatestring(aValue: string): Time;

    /**
    * Returns a new Time instance from a date-time string, e.g
    * 2015-01-02T03:04:05. If a property is specified, the timezone is set up
    * from the property's TZID parameter.
    *
    * @param {string} aValue         The string to create from
    * @param {Property=} prop   The property the date belongs to
    * @return {Time}            The date/time instance
    */
    static fromDateTimestring(aValue: string, prop?: Property): Time;

    /**
    * Returns a new Time instance from a date or date-time string,
    *
    * @param {string} aValue         The string to create from
    * @return {Time}            The date/time instance
    */
    static fromString(aValue: string): Time;

    /**
    * Creates a new Time instance from the given Javascript Date.
    *
    * @param {?Date} aDate     The Javascript Date to read, or null to reset
    * @param {boolean} useUTC  If true, the UTC values of the date will be used
    */
    static fromJSDate(aDate?: Date, useUTC?: boolean): Time;

    /**
    * Creates a new Time instance from the the passed data object.
    *
    * @param {Object} aData            Time initialization
    * @param {number=} aData.year      The year for this date
    * @param {number=} aData.month     The month for this date
    * @param {number=} aData.day       The day for this date
    * @param {number=} aData.hour      The hour for this date
    * @param {number=} aData.minute    The minute for this date
    * @param {number=} aData.second    The second for this date
    * @param {boolean=} aData.isDate   If true, the instance represents a date
    *                                    (as opposed to a date-time)
    * @param {Timezone=} aZone    Timezone this position occurs in
    */
    static fromData(aData: { year: number, month: number, day: number, hour: number, minute: number, second: number, isDate: boolean }, aZone?: Timezone): void;

    /**
    * Creates a new Time instance from the current moment.
    * @return {Time}
    */
    static now(): Time;

    /**
    * Returns the date on which ISO week number 1 starts.
    *
    * @see Time#weeknumber
    * @param {number} aYear                  The year to search in
    * @param {weekDay=} aWeekStart The week start weekday, used for calculation.
    * @return {Time}                    The date on which week number 1 starts
    */
    static weekOneStarts(aYear: number, aWeekStart?: weekDay): Time;

    /**
    * Get the dominical letter for the given year. Letters range from A - G for
    * common years, and AG to GF for leap years.
    *
    * @param {number} yr           The year to retrieve the letter for
    * @return {string}             The dominical letter.
    */
    static getDominicalLetter(yr: number): string;

    /**
    * January 1st, 1970 as an Time.
    * @type {Time}
    * @constant
    * @instance
    */
    static epochTime: Time;

    /**
    * The days that have passed in the year after a given month. The array has
    * two members, one being an array of passed days for non-leap years, the
    * other analog for leap years.
    * @example
    * var isLeapYear = Time.isLeapYear(year);
    * var passedDays = Time.daysInYearPassedMonth[isLeapYear][month];
    * @type {Array.<Array.<number>>}
    */
    static daysInYearPassedMonth: number[][];

    /**
    * The default weekday for the WKST part.
    * @constant
    * @default Time.MONDAY
    */
    static DEFAULT_WEEK_START: any;

}

/**
* The weekday, 1 = SUNDAY, 7 = SATURDAY. Access via
* Time.MONDAY, Time.TUESDAY, ...
*
* @typedef {number} weekDay
* @memberof Time
*/
type weekDay = number;

/**
* @classdesc
* Timezone representation, created by passing in a tzid and component.
*
* @example
* var vcalendar;
* var timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
* var tzid = timezoneComp.getFirstPropertyValue('tzid');
*
* var timezone = new Timezone({
*   component: timezoneComp,
*   tzid
* });
*
* @class
* @param {Component|Object} data options for class
* @param {string|Component} data.component
*        If data is a simple object, then this member can be set to either a
*        string containing the component data, or an already parsed
*        Component
* @param {string} data.tzid      The timezone identifier
* @param {string} data.location  The timezone locationw
* @param {string} data.tznames   An alternative string representation of the
*                                  timezone
* @param {number} data.latitude  The latitude of the timezone
* @param {number} data.longitude The longitude of the timezone
*/
export class Timezone {
    /**
    * @classdesc
    * Timezone representation, created by passing in a tzid and component.
    *
    * @example
    * var vcalendar;
    * var timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
    * var tzid = timezoneComp.getFirstPropertyValue('tzid');
    *
    * var timezone = new Timezone({
    *   component: timezoneComp,
    *   tzid
    * });
    *
    * @class
    * @param {Component|Object} data options for class
    * @param {string|Component} data.component
    *        If data is a simple object, then this member can be set to either a
    *        string containing the component data, or an already parsed
    *        Component
    * @param {string} data.tzid      The timezone identifier
    * @param {string} data.location  The timezone locationw
    * @param {string} data.tznames   An alternative string representation of the
    *                                  timezone
    * @param {number} data.latitude  The latitude of the timezone
    * @param {number} data.longitude The longitude of the timezone
    */
    constructor(data: (Component|{ component: (string|Component), tzid: string, location: string, tznames: string, latitude: number, longitude: number }));

    /**
    * Timezone identifier
    * @type {string}
    */
    tzid: string;

    /**
    * Timezone location
    * @type {string}
    */
    location: string;

    /**
    * Alternative timezone name, for the string representation
    * @type {string}
    */
    tznames: string;

    /**
    * The primary latitude for the timezone.
    * @type {number}
    */
    latitude: number;

    /**
    * The primary longitude for the timezone.
    * @type {number}
    */
    longitude: number;

    /**
    * The vtimezone component for this timezone.
    * @type {Component}
    */
    component: Component;

    /**
    * The year this timezone has been expanded to. All timezone transition
    * dates until this year are known and can be used for calculation
    *
    * @private
    * @type {number}
    */
    private expandedUntilYear: number;

    /**
    * The class identifier.
    * @constant
    * @type {string}
    * @default "icaltimezone"
    */
    icalclass: string;

    /**
    * Sets up the current instance using members from the passed data object.
    *
    * @param {Component|Object} aData options for class
    * @param {string|Component} aData.component
    *        If aData is a simple object, then this member can be set to either a
    *        string containing the component data, or an already parsed
    *        Component
    * @param {string} aData.tzid      The timezone identifier
    * @param {string} aData.location  The timezone locationw
    * @param {string} aData.tznames   An alternative string representation of the
    *                                  timezone
    * @param {number} aData.latitude  The latitude of the timezone
    * @param {number} aData.longitude The longitude of the timezone
    */
    fromData(aData: (Component|{ component: (string|Component), tzid: string, location: string, tznames: string, latitude: number, longitude: number })): void;

    /**
    * Finds the utcOffset the given time would occur in this timezone.
    *
    * @param {Time} tt        The time to check for
    * @return {number} utc offset in seconds
    */
    utcOffset(tt: Time): number;

    /**
    * The string representation of this timezone.
    * @return {string}
    */
    toString(): string;

    /**
    * Convert the date/time from one zone to the next.
    *
    * @param {Time} tt                  The time to convert
    * @param {Timezone} from_zone       The source zone to convert from
    * @param {Timezone} to_zone         The target zone to conver to
    * @return {Time}                    The converted date/time object
    */
    static convert_time(tt: Time, from_zone: Timezone, to_zone: Timezone): Time;

    /**
    * Creates a new Timezone instance from the passed data object.
    *
    * @param {Component|Object} aData options for class
    * @param {string|Component} aData.component
    *        If aData is a simple object, then this member can be set to either a
    *        string containing the component data, or an already parsed
    *        Component
    * @param {string} aData.tzid      The timezone identifier
    * @param {string} aData.location  The timezone locationw
    * @param {string} aData.tznames   An alternative string representation of the
    *                                  timezone
    * @param {number} aData.latitude  The latitude of the timezone
    * @param {number} aData.longitude The longitude of the timezone
    */
    static fromData(aData: (Component|{ component: (string|Component), tzid: string, location: string, tznames: string, latitude: number, longitude: number })): void;

    /**
    * The instance describing the UTC timezone
    * @type {Timezone}
    * @constant
    * @instance
    */
    static utcTimezone: Timezone;

    /**
    * The instance describing the local timezone
    * @type {Timezone}
    * @constant
    * @instance
    */
    static localTimezone: Timezone;

    /**
    * Adjust a timezone change object.
    * @private
    * @param {Object} change     The timezone change object
    * @param {number} days       The extra amount of days
    * @param {number} hours      The extra amount of hours
    * @param {number} minutes    The extra amount of minutes
    * @param {number} seconds    The extra amount of seconds
    */
    private static adjust_change(change: Object, days: number, hours: number, minutes: number, seconds: number): void;

}

/**
* @classdesc
* Singleton class to contain timezones.  Right now its all manual registry in
* the future we may use this class to download timezone information or handle
* loading pre-expanded timezones.
*
* @namespace
* @alias TimezoneService
*/
declare module TimezoneService {
    /**
    * Checks if timezone id has been registered.
    *
    * @param {string} tzid     Timezone identifier (e.g. America/Los_Angeles)
    * @return {boolean}        False, when not present
    */
    function has(tzid: string): boolean;

    /**
    * Returns a timezone by its tzid if present.
    *
    * @param {string} tzid     Timezone identifier (e.g. America/Los_Angeles)
    * @return {?Timezone} The timezone, or null if not found
    */
    function get(tzid: string): Timezone;

    /**
    * Registers a timezone object or component.
    *
    * @param {string=} name
    *        The name of the timezone. Defaults to the component's TZID if not
    *        passed.
    * @param {Component|Timezone} zone
    *        The initialized zone or vtimezone.
    */
    function register(name: string | null, zone: (Component|Timezone)): void;

    /**
    * Removes a timezone by its tzid from the list.
    *
    * @param {string} tzid     Timezone identifier (e.g. America/Los_Angeles)
    * @return {?Timezone} The removed timezone, or null if not registered
    */
    function remove(tzid: string): Timezone;

}

/**
* @classdesc
* This class represents the "duration" value type, with various calculation
* and manipulation methods.
*
* @class
* @alias UtcOffset
* @param {Object} aData          An object with members of the utc offset
* @param {number=} aData.hours   The hours for the utc offset
* @param {number=} aData.minutes The minutes in the utc offset
* @param {number=} aData.factor  The factor for the utc-offset, either -1 or 1
*/
export class UtcOffset {
    /**
    * @classdesc
    * This class represents the "duration" value type, with various calculation
    * and manipulation methods.
    *
    * @class
    * @alias UtcOffset
    * @param {Object} aData          An object with members of the utc offset
    * @param {number=} aData.hours   The hours for the utc offset
    * @param {number=} aData.minutes The minutes in the utc offset
    * @param {number=} aData.factor  The factor for the utc-offset, either -1 or 1
    */
    constructor(aData: { hours: number, minutes: number, factor: number });

    /**
    * The hours in the utc-offset
    * @type {number}
    */
    hours: number;

    /**
    * The minutes in the utc-offset
    * @type {number}
    */
    minutes: number;

    /**
    * The sign of the utc offset, 1 for positive offset, -1 for negative
    * offsets.
    * @type {number}
    */
    factor: number;

    /**
    * The type name, to be used in the jCal object.
    * @constant
    * @type {string}
    * @default "utc-offset"
    */
    icaltype: string;

    /**
    * Returns a clone of the utc offset object.
    *
    * @return {UtcOffset}     The cloned object
    */
    clone(): UtcOffset;

    /**
    * Sets up the current instance using members from the passed data object.
    *
    * @param {Object} aData          An object with members of the utc offset
    * @param {number=} aData.hours   The hours for the utc offset
    * @param {number=} aData.minutes The minutes in the utc offset
    * @param {number=} aData.factor  The factor for the utc-offset, either -1 or 1
    */
    fromData(aData: { hours: number, minutes: number, factor: number }): void;

    /**
    * Sets up the current instance from the given seconds value. The seconds
    * value is truncated to the minute. Offsets are wrapped when the world
    * ends, the hour after UTC+14:00 is UTC-12:00.
    *
    * @param {number} aSeconds         The seconds to convert into an offset
    */
    fromSeconds(aSeconds: number): void;

    /**
    * Convert the current offset to a value in seconds
    *
    * @return {number}                 The offset in seconds
    */
    toSeconds(): number;

    /**
    * Compare this utc offset with another one.
    *
    * @param {UtcOffset} other        The other offset to compare with
    * @return {number}                     -1, 0 or 1 for less/equal/greater
    */
    compare(other: UtcOffset): number;

    /**
    * The iCalendar string representation of this utc-offset.
    * @return {string}
    */
    toICALstring(): string;

    /**
    * The string representation of this utc-offset.
    * @return {string}
    */
    toString(): string;

    /**
    * Creates a new {@link UtcOffset} instance from the passed string.
    *
    * @param {string} astring    The string to parse
    * @return {Duration}    The created utc-offset instance
    */
    static fromString(astring: string): Duration;

    /**
    * Creates a new {@link UtcOffset} instance from the passed seconds
    * value.
    *
    * @param {number} aSeconds       The number of seconds to convert
    */
    static fromSeconds(aSeconds: number): void;

}

/**
* Describes a vCard time, which has slight differences to the Time.
* Properties can be null if not specified, for example for dates with
* reduced accuracy or truncation.
*
* Note that currently not all methods are correctly re-implemented for
* VCardTime. For example, comparison will have undefined results when some
* members are null.
*
* Also, normalization is not yet implemented for this class!
*
* @alias VCardTime
* @class
* @extends {Time}
* @param {Object} data                           The data for the time instance
* @param {number=} data.year                     The year for this date
* @param {number=} data.month                    The month for this date
* @param {number=} data.day                      The day for this date
* @param {number=} data.hour                     The hour for this date
* @param {number=} data.minute                   The minute for this date
* @param {number=} data.second                   The second for this date
* @param {Timezone|UtcOffset} zone     The timezone to use
* @param {string} icaltype                       The type for this date/time object
*/
export class VCardTime extends Time {
    /**
    * Describes a vCard time, which has slight differences to the Time.
    * Properties can be null if not specified, for example for dates with
    * reduced accuracy or truncation.
    *
    * Note that currently not all methods are correctly re-implemented for
    * VCardTime. For example, comparison will have undefined results when some
    * members are null.
    *
    * Also, normalization is not yet implemented for this class!
    *
    * @alias VCardTime
    * @class
    * @extends {Time}
    * @param {Object} data                           The data for the time instance
    * @param {number=} data.year                     The year for this date
    * @param {number=} data.month                    The month for this date
    * @param {number=} data.day                      The day for this date
    * @param {number=} data.hour                     The hour for this date
    * @param {number=} data.minute                   The minute for this date
    * @param {number=} data.second                   The second for this date
    * @param {Timezone|UtcOffset} zone     The timezone to use
    * @param {string} icaltype                       The type for this date/time object
    */
    constructor(data: { year: number, month: number, day: number, hour: number, minute: number, second: number }, zone: (Timezone|UtcOffset), icaltype: string);

    /**
    * Returns a new VCardTime instance from a date and/or time string.
    *
    * @param {string} aValue     The string to create from
    * @param {string} aIcalType  The type for this instance, e.g. date-and-or-time
    * @return {VCardTime}   The date/time instance
    */
    static fromDateAndOrTimestring(aValue: string, aIcalType: string): VCardTime;

}
