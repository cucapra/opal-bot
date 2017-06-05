/**
 * Abstract interface for bot-like communication.
 */

/**
 * An ongoing textual interaction with a single user.
 */
export interface Conversation {
  /**
   * Send a message in the conversation.
   */
  send(text: string): void;

  /**
   * Wait for a message in this conversation.
   */
  recv(): Promise<string>;

  /**
   * A string identifying the user that this conversation is with.
   */
  user(): string;

  /**
   * A namespace indicating the scope of user IDs (e.g., the service where the
   * user is logged in). Two users with the same user ID in different
   * namespaces are different users.
   */
  namespace(): string;
}

/**
 * Conversation handlers get an initial message and an object to represent
 * the continuing conversation.
 */
export type ConversationHandler =
  (message: string, conv: Conversation) => void;

/**
 * A bot connection dispatches to conversation handlers.
 */
export interface Bot {
  /**
   * Register a callback for new conversations.
   */
  onConverse(handler: ConversationHandler): void;
}
