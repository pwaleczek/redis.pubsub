/**
 *  @file:      redis-pub-sub.js
 *  @author:    Pawel Waleczek <pawel@thisismuasterisk.org>
 *
 *  @license:   MIT
 **/

var redis = require('redis')
  , os = require('os')
  , Query = require('./query')
  , Lookup = Query.Lookup
  , common = require('common')
  , config
  , options
  , eventEmiter

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
  this.filter = Query.Filter()

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
    callback = callback ||function () {}
    channel = channel || '*'

    var _this = this

    this._sub = redis.createClient(config.port, config.host, options)
    this._sub.on('pmessage', function (pattern, _channel, message) {
      _this.filter.check(JSON.parse(message))
    })
    this._sub.psubscribe(channel, callback)

    if (this._channels)
      this._channels.push(channel)
    else
      this._channels = new Array(channel)

    this._queue = {}

    this.on = on
    this.off = off

    return this
  }

  if (this instanceof PubSub) {
    return this.PubSub
  } else {
    return new PubSub()
  }
}


/**
 * Emit (publish) a message
 *
 * @param {channel} [string] publishing channel
 * @param {message} [mixed] message to be published, can be anything
 *
 **/
var emit = function(channel, message) {
  if (!this._pub) {
    throw new Error('Can\'t publish without a client!')
    return
  }
  this._pub.publish(channel, JSON.stringify(message))

  return this
}

/**
 * Set a listener
 *
 * @param {channel} [string] listenning channel, name or parretn ('name.*')
 * @param {callback} [function] callback for when a message is recieved
 *      callback arguments:
 *           @arg {_channel} [string|RegExp|] emiter's publishing channel
 *           @arg {message} [mixed] recieved message, JSON decoded
 *           @arg {pattern} [string] listenner's channel pattern
 **/
function on(query, filter, callback) {
  if (!this._sub) {
    throw new Error('Can\'t subscribe without a client!')
    return
  }

  var _this = this
    , id = common.gensym()
    , lookup = Lookup(filter)

  callback = callback || function () {}

  this._queue[id] = this.filter.query(query, function(data) {
    if (Object.keys(data).length > 0)
      callback(lookup(data))
  })

  return this
}

/**
 * Stop listenning
 *
 * @param {id} [string] unsubscribe
 *
 **/
function off(id) {
  this._queue[id]()
  delete this._queue[id]
  return this
}

/**
 * Possibly clean up everything
 *
 **/
function cleanUp() {
  if (this._pub) this._pub.quit()
  if (this._sub) {
    var _this = this
    this._channels.forEach(function (channel) {
      _this._sub.punsubscribe(channel)
    })
    this._sub.quit()
  }
}
