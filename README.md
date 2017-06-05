opal-bot
========

A fledgling calendar bot to showcase Opal. It currently connects to [Slack][] and uses [Wit][] for NLU.

[slack]: https://slack.com
[wit]: https://wit.ai

Here's how to get it running:

1. `npm install` (or `yarn`) and then `tsc`.
2. Obtain a [Slack bot access token][slackbot]. Put this in the `WIT_ACCESS_TOKEN` environment variable.
3. Obtain a [Wit][] API token. Put this in the `SLACK_BOT_TOKEN` environment variable.
4. Run `node build/bot.js`.

[slackbot]: https://api.slack.com/bot-users

Or, you can run a local version for fun by skipping the Slack token and providing the `-t` flag (for *terminal*).
