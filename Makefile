PHONY: dev

up: 
	rm database.sqlite
	yarn db:create
	yarn migrate
	yarn seed
	yarn start

build:
	yarn build

