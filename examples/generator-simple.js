'use strict';
// **Github:** https://github.com/toajs/toa
//
// **License:** MIT
var Toa = require('toa');
var Router = require('toa-router');
var BodyParser = require('../');

var router = new Router();
var bodyParser = BodyParser();

router.define('/')
  .get(function (Thunk) {
    this.body = 'Hi, toa body';
  })
  .post(function* (Thunk) {
    this.body = yield bodyParser(this.request, Thunk);
  })
  .put(function* (Thunk) {
    this.body = yield bodyParser(this.request, Thunk);
  });

Toa(function* (Thunk) {
  yield router.route(this, Thunk);
}).listen(3000);
