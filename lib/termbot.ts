/**
 * Local conversations in the terminal (for testing).
 */

import * as basebot from './basebot';
import * as readline from 'readline';

/**
 * A conversation that interacts with the user in the terminal.
 */
class Conversation implements basebot.Conversation {
  constructor(
    public termbot: TerminalBot,
    public userId: string,
  ) {}

  send(text: string) {
    this.termbot.rl.write(text);
  }

  async recv() {
    return await this.termbot.wait();
  }

  who(): [string, string] {
    return ["terminal", this.userId];
  }
}

type MessageHandler = (message: string) => void;

/**
 * A debugging bot that interacts via stdout/stdin.
 */
class TerminalBot {
  public waiters: MessageHandler[] = [];
  public rl: readline.ReadLine;

  /**
   * A handler for messages that no one's waiting for.
   */
  public convHandler: basebot.ConversationHandler | null = null;

  constructor() {
    this.rl = readline.createInterface(process.stdin, process.stdout);

    // Handle input.
    this.rl.on('line', (line: string) => {
      let text = line.trim();

      // Is a conversation waiting for this line?
      let callback = this.waiters.pop();
      if (callback) {
        // Use the existing conversation.
        callback(text);
      } else {
        // Start a new converstion.
        if (this.convHandler) {
          this.convHandler(text, new Conversation(this, "user"));
        }
      }
    });
  }

  /**
   * Get the next line from the console.
   */
  wait(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Set the handler for new conversations.
   */
  onConverse(handler: basebot.ConversationHandler) {
    this.convHandler = handler;
  }
}
