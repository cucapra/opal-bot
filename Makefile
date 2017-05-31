.PHONY: build
build:
	yarn
	yarn run build

.PHONY: deploy
deploy:
	ssh waffle 'cd waffle; docker-compose exec opal git pull; \
		docker-compose exec opal make; docker-compose restart opal'
