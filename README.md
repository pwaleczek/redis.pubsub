# Redis.PubSub [![Build Status](https://travis-ci.org/pwaleczek/redis.pubsub.png)](https://travis-ci.org/pwaleczek/redis.pubsub) [![NPM version](https://badge.fury.io/js/redis.pubsub.png)](http://badge.fury.io/js/redis.pubsub)

Node.js wrapper for Redis' Publish - Subscribe messageing pattern.
Supports message filtering and more.

  > Tested with node 0.10.15

##Changelog

###v1.0.1:
  * added channel and pattern info to be trnsfered along with data as extra parameters

###v1.0.0:
  * correct version numbering and some fixes

###v0.1.6:
  * arrays can now be processed with queries

###v0.1.5: Notable changes since v0.1.0
  * __New way to create instances__
  * The __.on__ method takes different parameters
  * Filtering messages is possible using mongoDB-like queries or regular expressions

###v0.1.0: Initial forking release

##Install

  ```bash
  $ npm install redis.pubsub --save
  ```

  > Test

  ```bash
  $ make test
  ```

## Usage

### Include in the project

```javascript
  var redisPubSub = require('redis.pubsub')([config [, options]])
```

  * __config__: `{ port || 6379, host || 'localhost', pass }`. `port`, `host` and `password` to connect to a Redis server.
  * __options__: Accepts all options for Redis' `createClient()` [method](http://github.com/mranney/node_redis#rediscreateclientport-host-options).

---
### Create an instance

```javascript
  // listener only
  var Sub = (new redisPubSub).Sub()

  // emiter only
  var Pub = (new redisPubSub).Pub()

  // instance can be a Publisher and Subscriber (emit and listen)
  // simply chain the above methods.
  var PubSub = (new redisPubSub).Pub().Sub()
```

---
### Set up an emiter

```javascript
  PubSub.emit(channel, message)
```

  * __channel__: Name of a publishing channel, e. g. `drain` or `drain.pipe` | defaults to `*`
  * __message__: Object to be published. Strings do not apply!.

---
### Set up a listener

```javascript
  var sub = PubSub.on(query, filter, callback = function (data, channel, pattern) {
    // process your data here
  })
```
  * __query__: query to filter messages. Supports mongoDB-like queries and regular expressions.
  TODO: queries description
  * __filter__: filter returned data by displaying only selected keys
  * __callback__: function to process returned `data` sent on a specific `channel` and captured by a listener `pattern`

  Function returns reference to subscription.

---
### Disable a listener

You can unsubscribe by:

```javascript
  // calling a reference object from when subscribing
  sub([callback])

  // or using the reference as a param (single or multiple as an array)
  PubSub.off(target[, callback])
```

  * __target__: reference to a subscription or an array of subscription objects
  * __callback__: optional

---
### Clear all queue filters aka reset

```javascript
  PubSub.clear([callback])
```

  * __callback__: optional

---
### Destroy the instance and Redis client

Method removes all subscriptions, clears the filter queue and removes the Redis client.

```javascript
  PubSub.cleanUp([callback])
```

  * __callback__: optional

##Example

```javascript
  // TODO: write this
```

##License

Copyright (C) 2013 Paweł Waleczek

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
