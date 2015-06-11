'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

var toa = require('toa')
var toaBody = require('../index')

var app = toa(function * () {
  this.body = yield this.parseBody()
})

toaBody(app)
app.listen(3000)
