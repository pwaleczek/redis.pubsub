var should = require('should')
  , redisPubSub = require('../index')(/*local*/)
  , PubSub

describe('Redis Pub/Sub', function () {

  describe('Combined Publisher and Subscriber instance', function() {

    it('should create a combined Publisher and Subscriber instance', function (done) {

      PubSub = (new redisPubSub()).Pub().Sub()

      //PubSub.cleanUp()

      done()
    })

    it('should publish and recieve standard messages', function (done) {
      //var PubSub = (new redisPubSub()).Pub().Sub()

      var channelName = 'spec.test'
        , messageObject = { key: 'test message' }

      PubSub.on({}, {}, function (data) {
        data.should.be.a('object')
        //data.key.should.eql('test message')

        //PubSub.off(channelName)
        //PubSub.cleanUp()
        done()
      })

      PubSub.emit(channelName, messageObject)

    })

    // it('should publish and recieve pattern channel messages', function (done) {
    //   var PubSub = new redisPubSub.PubSub()

    //   var channelName = 'spec.test'
    //     , channelPattern = 'spec.*'
    //     , messageObject = { key: 'test message' }

    //   PubSub.on(channelPattern, function (channel, message, pattern) {
    //     channel.should.eql(channelName)
    //     pattern.should.eql(channelPattern)
    //     message.should.be.a('object')
    //     message.key.should.eql('test message')

    //     PubSub.off(channelPattern)

    //     PubSub.cleanUp()

    //     done()
    //   }, function() {
    //     PubSub.emit(channelName, messageObject)
    //   })
    // })
  })

  // describe('Separate Publisher and Subscriber instances', function () {

  //   it('should create a combined Publisher and Subscriber instance', function (done) {
  //     var Pub = new redisPubSub.Pub()
  //       , Sub = new redisPubSub.Sub()

  //     Pub.cleanUp()
  //     Sub.cleanUp()

  //     done()
  //   })

  //   it('should publish and recieve standard messages', function (done) {
  //     var Pub = new redisPubSub.Pub()
  //       , Sub = new redisPubSub.Sub()

  //     var channelName = 'spec.test'
  //       , messageObject = { key: 'test message' }

  //     Sub.on(channelName, function (channel, message) {
  //       channel.should.eql(channelName)
  //       message.should.be.a('object')
  //       message.key.should.eql('test message')

  //       Sub.off(channelName)

  //       Pub.cleanUp()
  //       Sub.cleanUp()

  //       done()
  //     }, function() {
  //       Pub.emit(channelName, messageObject)
  //     })
  //   })

  //   it('should publish and recieve pattern channel messages', function (done) {
  //     var Pub = new redisPubSub.Pub()
  //       , Sub = new redisPubSub.Sub()

  //     var channelName = 'spec.test'
  //       , channelPattern = 'spec.*'
  //       , messageObject = { key: 'test message' }

  //     Sub.on(channelPattern, function (channel, message, pattern) {
  //       channel.should.eql(channelName)
  //       pattern.should.eql(channelPattern)
  //       message.should.be.a('object')
  //       message.key.should.eql('test message')

  //       Sub.off(channelPattern)

  //       Pub.cleanUp()
  //       Sub.cleanUp()

  //       done()
  //     }, function() {
  //       Pub.emit(channelName, messageObject)
  //     })
  //   })
  // })
})
