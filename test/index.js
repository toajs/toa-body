'use strict';
// **Github:** https://github.com/toajs/toa-router
//
// **License:** MIT

/**!
* modified from https://github.com/koajs/body-parser
*
* Authors:
*   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
*   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
*/
/*global describe, it, before, after, beforeEach, afterEach*/

var fs = require('fs');
var path = require('path');
var request = require('supertest');
var Toa = require('toa');
var should = require('should');
var BodyParser = require('../');

var fixtures = path.join(__dirname, 'fixtures');

describe('toa-body', function () {
  describe('json body', function () {
    it('should parse json body ok', function (done) {
      var bodyParser = BodyParser();
      var app = Toa(function (Thunk) {
        return Thunk.call(this, bodyParser(this.request, Thunk))(function (err, body) {
          this.request.body.should.eql({foo: 'bar'});
          this.request.body.should.equal(body);
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .send({foo: 'bar'})
        .expect({foo: 'bar'}, done);
    });

    it('should parse json body with json-api headers ok', function (done) {
      var bodyParser = BodyParser();
      var app = Toa(function (Thunk) {
        return Thunk.call(this, bodyParser(this.request, Thunk))(function (err, body) {
          this.request.body.should.equal(body);
          // should work when use body parser again
          return bodyParser(this.request, Thunk);
        })(function (err, body) {
          this.request.body.should.eql({foo: 'bar'});
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .set('Accept', 'application/vnd.api+json')
        .set('Content-type', 'application/vnd.api+json')
        .send('{"foo": "bar"}')
        .expect({ foo: 'bar' }, done);
    });

    it('should parse json patch', function (done) {
      var bodyParser = BodyParser();
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.request.body.should.eql( [{op: 'add', path: '/foo', value: 'bar'}] );
          this.body = body;
        });
      });

      request(app.listen(3000))
        .patch('/')
        .set('Content-type', 'application/json-patch+json')
        .send('[{"op": "add", "path": "/foo", "value": "bar"}]')
        .expect([{op: 'add', path: '/foo', value: 'bar'}], done);
    });

    it('should json body reach the limit size', function (done) {
      var bodyParser = BodyParser({jsonLimit: 100});
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.body = body;
        });
      });
      request(app.listen(3000))
        .post('/')
        .send(require(path.join(fixtures, 'raw.json')))
        .expect(413, done);
    });
  });

  describe('form body', function () {
    it('should parse form body ok', function (done) {
      var bodyParser = BodyParser();
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.request.body.should.eql( { foo: {bar: 'baz'} } );
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .type('form')
        .send({foo: {bar: 'baz'}})
        .expect({foo: {bar: 'baz'}}, done);
    });

    it('should parse form body reach the limit size', function (done) {
      var bodyParser = BodyParser({formLimit: 10});
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .type('form')
        .send({foo: {bar: 'bazzzzzzz'}})
        .expect(413, done);
    });
  });

  describe('extent type', function () {
    it('should extent json ok', function (done) {
      var bodyParser = BodyParser({
        extendTypes: {
          json: 'application/x-javascript'
        }
      });
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({foo: 'bar'}))
        .expect({foo: 'bar'}, done);
    });

    it('should extent json with array ok', function (done) {
      var bodyParser = BodyParser({
        extendTypes: {
          json: ['application/x-javascript', 'application/y-javascript']
        }
      });
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          this.body = body;
        });
      });

      request(app.listen(3000))
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({ foo: 'bar' }))
        .expect({ foo: 'bar' }, done);
    });
  });

  describe('other type', function () {
    it('should get body null', function (done) {
      var bodyParser = BodyParser();
      var app = Toa(function (Thunk) {
        return bodyParser.call(this, this.request, Thunk)(function (err, body) {
          should.not.exist(this.request.body);
          done();
        });
      });

      request(app.listen(3000))
        .get('/')
        .end(function () {});
    });
  });
});
