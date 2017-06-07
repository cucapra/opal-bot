Multibot
========

A toolkit for building chatbots for multiple chat services.

There are currently two backends, for [Slack][] and a debugging terminal interface. Both use a common base infrastructure (see `basebot`) to abstract the basics of sending and receiving one-on-one messages with human users. But you can also use the individual connections directly for platform-specific behavior.

[slack]: https://slack.com
