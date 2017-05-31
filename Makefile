.PHONY: build
build:
	yarn
	yarn run build

.PHONY: run
run:
	node build/bot.js

.PHONY: deploy
deploy:
	ssh waffle 'cd waffle; docker-compose exec opal /bin/sh update.sh; \
		docker-compose restart opal'
