'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

const Toa = require('toa')
const toaBody = require('../index')

const app = new Toa()
app.use(function * () {
  this.body = yield this.parseBody()
})

toaBody(app)
app.listen(3000)
