'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

var toa = require('toa')
var toaBody = require('../index')

var app = toa(function () {
  return this.parseBody()(function (err, body) {
    console.log(err, body, this.request.body)
    this.body = body
  })
})

toaBody(app)
app.listen(3000)
