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
    public user: string,
  ) {}

  send(text: string) {
    this.termbot.print(text);
  }

  async recv() {
    return await this.termbot.wait();
  }

  namespace = "terminal";
}

type MessageHandler = (message: string) => void;

/**
 * A debugging bot that interacts via stdout/stdin.
 */
export class TerminalBot implements basebot.Bot {
  public waiters: MessageHandler[] = [];
  public rl: readline.ReadLine;

  /**
   * A handler for messages that no one's waiting for.
   */
  public convHandler: basebot.ConversationHandler | null = null;

  /**
   * Wait for terminal input and dispatch it.
   */
  run() {
    this.rl = readline.createInterface(process.stdin, process.stdout);
    this.rl.setPrompt('>>> ');

    // Handle input.
    this.rl.prompt();
    this.rl.on('line', async (line: string) => {
      let text = line.trim();

      // Is a conversation waiting for this line?
      let callback = this.waiters.pop();
      if (callback) {
        // Use the existing conversation.
        await callback(text);
      } else {
        // Start a new converstion.
        if (this.convHandler) {
          await this.convHandler(text, new Conversation(this, "user"));
        }
      }
      this.rl.prompt();
    });
  }

  /**
   * Get the next line from the console.
   */
  wait(): Promise<string> {
    this.rl.prompt();
    return new Promise((resolve, reject) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Print a line of dialogue to the console.
   */
  print(message: string) {
    process.stdout.write('<<< ' + message + '\n');
  }

  /**
   * Set the handler for new conversations.
   */
  onConverse(handler: basebot.ConversationHandler) {
    this.convHandler = handler;
  }
}
