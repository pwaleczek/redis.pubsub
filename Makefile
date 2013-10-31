test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter nyan \
		test/spec.*.js

.PHONY: test
