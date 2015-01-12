'use strict';
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

var toa = require('toa');
var toaBody = require('../index');

var app = toa(function(Thunk) {
  this.parseBody(Thunk)(function(err, body) {
    this.body = body;
  });
  // or use as:
  // Thunk.call(this, this.parseBody())(function(err, body) {
  //   this.body = body;
  // });
});

toaBody(app);
app.listen(3000);
