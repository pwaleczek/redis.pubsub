var should = require('should')
  , redisPubSub = require('../lib/redis-pub-sub')(/*local*/)
  , PubSub

describe('Redis Pub/Sub', function () {

  it('should create an instance', function (done) {

    PubSub = new redisPubSub()
    if (PubSub instanceof redisPubSub)
      done()
  })

  it('should publish and recieve standard messages', function (done) {

    var channelName = 'spec.test'
      , messageObject = { key: 'test message' }

    var sub = PubSub.on({}, {}, function (data) {
      data.should.be.a('object')
      data.key.should.eql('test message')

      sub(done()) // unsubscribe
    })

    PubSub.emit(channelName, messageObject)

  })

  it('should use queries to filter messages', function (done) {

    var channelName = 'spec.test'
      , channelPattern = 'spec.*'
      , messageObject = [
            { key: 'test message' }
          , { age: 10, key: 'other message' }
          , { age: 21, key: 'none'}
        ]
    var sub = PubSub.on({ $has: ['key', 'age'], age: {$gt: 18}}, {}, function (data) {
      data.should.be.a('object')
      data.key.should.eql('none')

      sub(done())
    })

    // send multiple messages
    messageObject.forEach(function (message) {
      PubSub.emit(channelName, message)
    })
  })

  it('should use queries to filter arry messages', function (done) {

    var channelName = 'spec.test'
      , channelPattern = 'spec.*'
      , messageObject = [
            { key: 'test message' }
          , { age: 10, key: 'other message' }
          , { age: 21, key: 'none'}
        ]
    var sub = PubSub.on({ $has: ['key', 'age'], age: {$lt: 18}}, {}, function (data) {
      data.should.be.instanceof(Array)
      data[0].key.should.eql('other message')

      sub(done())
    })
    PubSub.emit(channelName, messageObject)

  })

  it('should be fast with simple object messages', function (done) {
    this.timeout(10 * 1000)

    var ITERATIONS = 100000
      , counter = 0
      , start
      , end

    var channelName = 'spec.test'
      , messageObject = { key: 'test message' }

    var sub = PubSub.on({}, {}, function (data) {
      counter++

      if (counter >= ITERATIONS) {
        sub(done()) // unsubscribe
      }

    })

    // setTimeout(function() {
      for (var i = 0; i < ITERATIONS; i++) {
          PubSub.emit(channelName, {key: 'test message', i: i})
      }
    // }, 1000)

  })

  it('should use more complex filters of message body', function(done) {
    var channelName = 'spec.test'
      , messageObject = [
            { key: 'test message' }
          , { age: 10, key: 'other message' }
          , { age: 21, key: 'none'}
        ]
      , channelNameTwo = 'spec.not_test'

    var sub = PubSub.on({ channel: { $not: 'spec.test' } }, {}, function (data) {
      data.should.be.instanceof(Object)
      data.key.should.eql('other channel')

      sub(done())
    })
    PubSub.emit(channelName, messageObject)
    PubSub.emit(channelNameTwo, { key: 'other channel' })
  })

  it('should unsubscribe from a query', function (done) {
    var sub = PubSub.on({}, {}, function (data) {
      // no need to process
    })

    PubSub.off(sub, done)
  })

  it('should unsubscribe from multiple queries', function (done) {
    var sub1 = PubSub.on({}, {}, function (data) {
      // no need to process
    })
    var sub2 = PubSub.on({}, {}, function (data) {
      // no need to process
    })

    var sub3 = PubSub.on({}, {}, function (data) {
      // no need to process
    })

    PubSub.off([sub1, sub2, sub3], done)
  })

  it('should remove all filter queue objects, aka unsubscribe', function (done) {
    PubSub.clear(done)
  })

  it('should clean up', function (done) {
    PubSub.cleanUp(done)
  })

})
