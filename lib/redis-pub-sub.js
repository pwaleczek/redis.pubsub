
// # Redis Pub/Sub

var redis = require('redis')
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

  return {
      PubSub: PubSub
    , Pub: Pub
    , Sub: Sub
  }
}

/**
 * Create a Publisher and Subscriber instance
 *
 **/
function PubSub() {
  this.pub = redis.createClient(config.port, config.host, options)
  this.pub.setMaxListeners(0) // unlimited (I hope so)
  this.sub = redis.createClient(config.port, config.host, options)
}

/**
 * Create a Publisher only instance
 *
 **/
function Pub() {
  this.pub = redis.createClient(config.port, config.host, options)
  this.pub.setMaxListeners(0)
}

/**
 * Emit (publish) a message
 *
 * @param {channel} [string] publishing channel
 * @param {message} [mixed] message to be published, can be anything
 *
 **/
function emit(channel, message) {
  this.pub.publish(channel, JSON.stringify(message))
}

Pub.prototype.emit = emit
PubSub.prototype.emit = emit


/**
 * Create a Subscriber only instance
 *
 **/
function Sub() {
  this.sub = redis.createClient(config.port, config.host, options)
}

/**
 * Set a listener
 *
 * @param {channel} [string] listenning channel, name or parretn ('name.*')
 * @param {callback} [function] callback for when a message is recieved
 *      callback arguments:
 *           @arg {_channel} [string] emiter's publishing channel
 *           @arg {message} [mixed] recieved message, JSON decoded
 *           @arg {pattern} [string] listenner's channel pattern
 **/
function on(channel, trigger, callback) {
  callback = callback || function () {}

  this.sub.on('pmessage', function (pattern, _channel, message) {
    trigger(_channel, JSON.parse(message), pattern)
  })
  this.sub.psubscribe(channel, callback)
}

Sub.prototype.on = on
PubSub.prototype.on = on

/**
 * Stop listenning
 *
 * @param {channel} [string] unsubscribe channel name or pattern
 *
 **/
function off(channel) {
  this.sub.punsubscribe(channel)
}

Sub.prototype.off = off
PubSub.prototype.off = off

/**
 * Possibly clean up when unsubscribing
 *
 **/
function cleanUp() {
  if (this.pub) this.pub.quit()
  if (this.sub) this.sub.quit()
}

Sub.prototype.cleanUp = cleanUp
Pub.prototype.cleanUp = cleanUp
PubSub.prototype.cleanUp = cleanUp
