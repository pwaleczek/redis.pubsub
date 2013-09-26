/*
 *  @file:      redis-pub-sub.js
 *  @author:    Pawel Waleczek <pawel@thisismyasterisk.org>
 *
 *  @license:   MIT
 */

var redis = require('redis')
  , EventEmitter = require('events').EventEmitter
  , Query = require('./query')
  , Filter = Query.Filter
  , common = require('common')
  , config
  , options

module.exports = setup

function setup(_config, _options) {
  switch (typeof _config) {
    case 'object':
      config = _config
      break
    case 'number':
      config = {
          port: _config
        , host: 'localhost'
        , pass: null
      }
      break
    default:
      config = {
          port: 6379
        , host: 'localhost'
        , pass: null
      }
  }

  switch (typeof _options) {
    case 'object':
      options = _options
      break
    case 'string':
      options = { auth_pass: _options }
      break
    default:
      if (config.pass !== null)
        options = { auth_pass: config.pass }
      else
        options = {}
  }

  return PubSub
}


var PubSub = function () {
  this.query = Query.create()

  this.cleanUp = cleanUp

  // Create a Publisher instance
  this.Pub = function () {
    this._pub = redis.createClient(config.port, config.host, options)
    this._pub.setMaxListeners(0) // unlimited (I hope so)
    this.emit = emit

    return this
  }

  // Create a Subscriber instance
  this.Sub = function (channel, callback) {

    if (channel instanceof Function) {
      callback = channel
      channel = null
    } else {
      callback = callback || function () {}
    }
    channel = channel || '*'

    var _this = this

    this._sub = redis.createClient(config.port, config.host, options)
    this._sub.on('pmessage', function (pattern, _channel, message) {
      _this.query.check(JSON.parse(message), _channel, pattern)
    })

    if (this._channels)
      this._channels.push(channel)
    else
      this._channels = new Array(channel)

    this.queue = {}

    this.on = on
    this.off = off
    this.clear = clear

    this._sub.psubscribe(channel, callback)

    return this
  }

  if (this instanceof PubSub)
    return this.PubSub
  else
    return new PubSub()
}



/*
 * Emit (publish) a message
 *
 * @param {channel}     [string] publishing channel | defaults to '*'
 * @param {message}      [mixed] message to be published, can be anything
 *                               that can be passed as JSON
 */
var emit = function(channel, message) {
  if (!this._pub) {
    throw new Error('Can\'t publish without a client!')
    return
  }
  if (typeof message !== 'string')
    message = JSON.stringify(message)

  this._pub.publish(channel, message)

  return this
}

/*
 * Set a listener
 *
 * @param {query}       [object] query for message filtering
 * @param {filter}      [object] specify which message keys to return | {} for all
 * @param {callback}  [function] callback for when a message is recieved
 *                               returns recieved data object
 */
function on(query, filter, callback) {
  if (!this._sub) {
    throw new Error('Can\'t subscribe without a client!')
    return
  }

  var _this = this
    , id = common.gensym()
    , filter = Filter(filter)

  callback = callback || function () {}

  this.queue[id] = this.query.add(query, function(data, channel, pattern) {
    if (Object.keys(data).length > 0)
      callback(filter(data), channel, pattern)
  })

  return function(_callback) {
    _callback = _callback || function () {}

    if (!_this.queue[id]) {
      return
    }
    _this.queue[id]()
    delete _this.queue[id]

    _callback()
  }
}

/*
 * Stop listenning
 *
 * @param {subscription} [function reference] unsubscribe
 * @param {calback} [function] optional callback
 */
function off(subscription, callback) {
  callback = callback || function () {}

  if(subscription instanceof Array) {
    subscription.forEach(function (el) {
      el()
    })
    callback()
    return
  }
  subscription(callback)
}

/*
 * Clear the queue aka stop listenning for anything
 *
 * @param {calback} [function] optional callback
 */
function clear(callback) {
  callback = callback || function () {}

  for (var key in this.queue) {
    delete this.queue[key]
  }
  this.queue = {}

  callback()
}

/*
 * Possibly clean up everything
 *
 * @param {calback} [function] optional callback
 */
function cleanUp(callback) {
  callback = callback || function () {}

  if (this._pub) this._pub.quit()
  if (this._sub) {
    var _this = this
    for (var key in this.queue) {
      delete this.queue[key]
    }
    this.queue = {}
    this._channels.forEach(function (channel) {
      _this._sub.punsubscribe(channel)
    })
    this._sub.quit()
  }

  callback()
}
