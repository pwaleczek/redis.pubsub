/*
 *  @file:      redis-pub-sub.js
 *  @author:    Pawel Waleczek <pawel@thisismyasterisk.org>
 *
 *  @license:   MIT
 */

var redis = require('redis');
var EventEmitter = require('events').EventEmitter;
var Query = require('./query');
var Filter = Query.Filter;
var common = require('common');
var config;
var options;

module.exports = setup;

function setup(_config, _options) {
  switch (typeof _config) {
    case 'object':
      config = _config;
      break;
    case 'number':
      config = {
          port: _config
        , host: 'localhost'
        , pass: null
      };
      break;
    default:
      config = {
          port: 6379
        , host: 'localhost'
        , pass: null
      };
  }

  switch (typeof _options) {
    case 'object':
      options = _options;
      break;
    case 'string':
      options = { auth_pass: _options };
      break;
    default:
      if (config.pass !== null)
        options = { auth_pass: config.pass };
      else
        options = {};
  }

  return PubSub;
}


var PubSub = function (/* polymorphic */) {
  var _this = this;

  // determine if using simple mode
  this.simple = !!(arguments[0] === 'simple') || false;

  // Create a Publisher instance
  this._pub = redis.createClient(config.port, config.host, options);
  this._pub.setMaxListeners(0); // unlimited (I hope so)
  this.emit = emit;

  // Create a Subscriber instance
  this._sub = redis.createClient(config.port, config.host, options);

  if (!this.simple) {
    this.query = Query.create();
    this.queue = {};

    this._sub.on('pmessage', function (pattern, channel, message) {
      message = JSON.parse(message);
      if (message instanceof Array) {
        message.forEach(function(chunk) {
          chunk.channel = channel.toString();
          chunk.pattern = pattern.toString();
        });
      } else {
        message.channel = channel.toString();
        message.pattern = pattern.toString();
      }
       _this.query.check(message, channel, pattern);
    })
    // Subscribe to all
    this._sub.psubscribe('*');

    // if (this._channels)
    //   this._channels.push(channel)
    // else
    //   this._channels = new Array(channel)

    this.on = (this.simple) ? onSimple : onQuery;
    this.off = (this.simple) ? offSimple : offQuery;
    this.clear = clear;

  }

  this.cleanUp = cleanUp;

  // if (this instanceof PubSub)
  //   return this.PubSub
  // else
  //   return new PubSub()
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
    throw new Error('Can\'t publish without a client!');
    return;
  }

  this._pub.publish(channel, JSON.stringify(message));
}

/*
 * Set a listener [default - query mode]
 *
 * @param {query}       [object] query for message filtering
 * @param {filter}      [object] specify which message keys to return | {} for all
 * @param {callback}  [function] callback for when a message is recieved
 *                               returns recieved data object
 */
function onQuery(query, filter, callback) {
  if (!this._sub) {
    throw new Error('Can\'t subscribe without a client!');
    return;
  }

  var _this = this;
  var id = common.gensym();
  var filter = Filter(filter);

  callback = callback || function () {};

  this.queue[id] = this.query.add(query, function(data, _channel, _pattern) {
    if (Object.keys(data).length > 0)
      if (data instanceof Array){
        data.forEach(function(chunk) {
          delete chunk.channel;
          delete chunk.pattern;
        })
      } else {
        delete data.channel;
        delete data.pattern;
      }
      callback(filter(data), _channel, _pattern);
  })

  return function(_callback) {
    _callback = _callback || function () {};

    if (!_this.queue[id]) {
      return;
    }
    _this.queue[id]();
    delete _this.queue[id];

    _callback();
  }
}

/*
 * Set a listener [simple mode]
 *
 * @param {channel}     [string] channel or pattern to subscribe to
 * @param {callback}  [function] callback for when a message is recieved
 *                               returns recieved data object
 */
function onSimple(channel, callback) {
  this._sub.psubscribe(channel, callback);
}

/*
 * Stop listenning [default - query mode]
 *
 * @param {subscription} [function reference] unsubscribe
 * @param {calback} [function] optional callback
 */
function offQuery(subscription, callback) {
  callback = callback || function () {};

  if (subscription instanceof Array) {
    subscription.forEach(function (el) {
      el();
    })
    callback();
    return;
  }
  subscription(callback);
}


/*
 * Stop listenning [simple mode]
 *
 * @param {channel} unsubscribe from a schannel or pattern
 * @param {calback} [function] optional callback
 */
function offSimple(channel, callback) {
  callback = callback || function () {};

  this._sub.punsubscribe(channel);

  callback();
}

/*
 * Clear the queue aka stop listenning for anything
 *
 * @param {calback} [function] optional callback
 */
function clear(callback) {
  callback = callback || function () {};

  if (this.simple) {
    this._sub.punsubscribe();
  } else {
    for (var key in this.queue) {
      delete this.queue[key];
    }
    this.queue = {};
  }
  callback();
}

/*
 * Possibly clean up everything
 *
 * @param {calback} [function] optional callback
 */
function cleanUp(callback) {
  var _this = this;

  callback = callback || function () {};

  if (this._pub) this._pub.quit();
  if (this._sub) {
    if (this.simple) {
      this.clear();
    } else {
      for (var key in this.queue) {
        delete this.queue[key];
      }
      this.queue = {};

      _this._sub.punsubscribe('*');

    }

    this._sub.quit();
  }

  callback();
}
