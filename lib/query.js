/**
 *  @file:      query.js
 *  @author:    Pawel Waleczek <pawel@thisismyasterisk.org>
 *
 *  @license:   MIT
 **/

var common = require('common')
  , compile = require('querify')

function Filter (query) {
  if(!query || !Object.keys(query).length) {
    return function (data) {
      return data
    }
  }

  return function (data) {
    var result = {}

    for (var key in query) {
      if (data[key])
        result[key] = data[key]
    }

    return result
  }
}

function Query () {
  this._list = {}
}

Query.prototype.add = function (query, fn) {
  var id = common.gensym()
    , compiled = compile(query)
    , list = this._list

  list[id] = function (data) {
    if (data instanceof Array) {
      var result = new Array()
      data.forEach(function (chunk) {
        if (compiled(chunk))
          result.push(chunk)
      })
      if (result.length > 0)
        fn(result)
    } else {
      if (compiled(data))
        fn(data)
    }
  }
  return function () {
    delete list[id]
  }
}

Query.prototype.check = function (data) {
  for (var key in this._list) {
    this._list[key](data)
  }
}

module.exports = {
    create: function () {
      return new Query()
    }
  , Filter: Filter
}
