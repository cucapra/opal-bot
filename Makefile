.PHONY: build
build:
	yarn
	yarn run build

.PHONY: run
run:
	node build/bot.js

.PHONY: buildrun
buildrun: build run

.PHONY: deploy
deploy:
	ssh waffle 'cd waffle; docker-compose restart opal'
