.PHONY: build
build:
	yarn
	yarn run build
	yarn run build-web

# Run the bot with environment variables from `.env` and arguments from $ARGS.
.PHONY: run
run:
	export $$(cat .env | xargs) && \
		node build/bot.js $(ARGS)

.PHONY: deploy update
deploy:
	ssh waffle 'cd waffle; docker-compose exec -T opal make update; \
		docker-compose restart opal'
update:
	git pull
	make
