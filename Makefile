test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		test/spec.*.js

.PHONY: test