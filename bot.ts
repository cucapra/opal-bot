const slack_client = require('@slack/client');

const bot_token = process.env.SLACK_BOT_TOKEN || '';

let rtm = new slack_client.RtmClient(bot_token);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(slack_client.CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData: any) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.start();
