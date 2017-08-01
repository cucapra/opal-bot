/**
 * Parameters for an OData query.
 *
 * (Surely there are more possible fields, but these are a few that work
 * here.)
 */
export interface ODataParams {
  '$select'?: string;
  '$orderby'?: string;
  '$top'?: number;
}

/**
 * Identifies an Office 365 user.
 */
export interface User {
  email: string;
  timezone: string;
}

/**
 * Parameters for raw API calls.
 */
export interface APICallParams {
  url: string;
  token: string;
  user: User;
  method: string;
  query: { [key: string]: string };
}

export module calendar {
  /**
   * Get events from a user's calendar.
   */
  export function getEvents(
    parameters: {
      token: string,
      user: User,
      odataParams: ODataParams,
    },
    callback: (error: any, result: any) => void
  ): void;
}

export module base {
  /**
   * Central API invocation function.
   */
  export function makeApiCall(
    parameters: APICallParams,
    callback: (error: any, response: any) => void,
  ): void;
}
