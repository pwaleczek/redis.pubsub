# Redis.PubSub [![Build Status](https://travis-ci.org/pwaleczek/redis.pubsub.png)](https://travis-ci.org/pwaleczek/redis.pubsub) [![NPM version](https://badge.fury.io/js/redis.pubsub.png)](http://badge.fury.io/js/redis.pubsub)

Node.js wrapper for Redis' Publish - Subscribe messageing pattern.

  > Tested with node 0.10.15

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
  var Sub = new redisPubSub.Sub()

  // emiter only
  var Pub = new redisPubSub.Pub()

  // instance can be a Publisher and Subscriber (emit and listen)
  var PubSub = new redisPubSub.PubSub()
```
---
### Set up an emiter
```javascript
  Pub.emit(channel, message)
  // or
  PubSub.emit(channel, message)
```
  * __channel__: Name of a publishing channel, e. g. `drain` or `drain.pipe`
  * __message__: Object to be published. Goes through `JSON.stringify`.

---
### Set up a listener
```javascript
  Sub.on(channel, message [, pattern])
  // or
  PubSub.on(channel, message [, pattern])
```
  * __channel__: Channel or channel pattern ending with a `*`, to listen for messages, e. g. `drain` or `drain.*`.
  * __message__: Captured message object. Coes through `JSON.parse`.
  * __pattern__: Pattern on name of a channel from which message was recieved.

---
### Disable a listener
```javascript
  Sub.off(channel)
  // or
  PubSub.off(channel)
```
  * __channel__: Pattern or name of a channel to stop listenning on.

---
### Destroy the instance and Redis client
```javascript
  Pub.cleanUp()
  // or
  Sub.cleanUp()
  // or
  PubSub.cleanUp()
```

##Example

```javascript
  // TODO: write this
```

##License

Copyright (C) 2013 Paweł Waleczek

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
