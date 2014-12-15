'use strict';
// **Github:** https://github.com/toajs/toa-body
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
  .post(function (Thunk) {
    return bodyParser.call(this, this.request, Thunk)(function (err, body) {
      this.body = body;
    });
  })
  .put(function (Thunk) {
    return bodyParser.call(this, this.request, Thunk)(function (err, body) {
      this.body = body;
    });
  });

Toa(function (Thunk) {
  return router.route(this, Thunk);
}).listen(3000);
