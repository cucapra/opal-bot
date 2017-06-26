.PHONY: build
build:
	yarn
	yarn run build

.PHONY: run
run:
	node build/bot.js

.PHONY: deploy update
deploy:
	ssh waffle 'cd waffle; docker-compose exec -T opal make update; \
		docker-compose restart opal'
update:
	git pull
	make
