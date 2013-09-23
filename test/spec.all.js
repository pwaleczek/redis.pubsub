var should = require('should')
  , redisPubSub = require('../index')(/*local*/)
  , PubSub

describe('Redis Pub/Sub', function () {

  it('should create an instance', function (done) {

    PubSub = (new redisPubSub()).Pub().Sub()

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
