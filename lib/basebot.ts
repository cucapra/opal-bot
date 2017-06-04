/**
 * Abstract interface for bot-like communication.
 */

/**
 * An ongoing textual interaction with a single user.
 */
export interface Conversation {
  send(text: string): void;
  recv(): Promise<string>;
}
