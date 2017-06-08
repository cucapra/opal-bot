opal-bot
========

A fledgling calendar bot to showcase Opal. It currently connects to [Slack][] and uses [Wit][] for NLU.

[slack]: https://slack.com
[wit]: https://wit.ai

Here's how to get it running:

1. `npm install` (or `yarn`) and then `tsc`.
2. Obtain a [Slack bot access token][slackbot]. Put this in the `WIT_ACCESS_TOKEN` environment variable.
3. To run on Facebook Messenger too, do the incredibly complicated dance to obtain Facebook credentials. Set the `FB_PAGE_TOKEN` variable for your bot and the `FB_VERIFY_TOKEN` variable to the string you chose when setting up your webhook.
4. Obtain a [Wit][] API token. Put this in the `SLACK_BOT_TOKEN` environment variable.
5. Run `node build/bot.js`. Use `-s` to run on Slack or `-f` to run on Facebook. (Both can work at once.)

[slackbot]: https://api.slack.com/bot-users

Or, you can run a local version for fun by skipping the Slack token and providing the `-t` flag (for *terminal*).
