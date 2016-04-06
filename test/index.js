'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

/**
 * modified from https://github.com/koajs/body-parser
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

var path = require('path')
var tman = require('tman')
var assert = require('assert')
var request = require('supertest')
var Toa = require('toa')
var toaBody = require('..')

var fixtures = path.join(__dirname, 'fixtures')

tman.suite('toa-body', function () {
  tman.suite('json body', function () {
    tman.it('should parse json body ok', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.strictEqual(this.request.body, body)
          assert.deepEqual(this.request.body, {
            foo: 'bar'
          })
          this.body = body
        })
      })

      toaBody(app)
      request(app.listen())
        .post('/')
        .send({
          foo: 'bar'
        })
        .expect({
          foo: 'bar'
        }, done)
    })

    tman.it('should parse json body with json-api headers ok', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.strictEqual(this.request.body, body)
          // should work when use body parser again
          return this.parseBody()
        })(function (err, body) {
          assert.strictEqual(err, null)
          assert.deepEqual(this.request.body, {
            foo: 'bar'
          })
          this.body = body
        })
      })
      toaBody(app)
      request(app.listen())
        .post('/')
        .set('Accept', 'application/vnd.api+json')
        .set('Content-type', 'application/vnd.api+json')
        .send('{"foo": "bar"}')
        .expect({
          foo: 'bar'
        }, done)
    })

    tman.it('should parse json patch', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.deepEqual(this.request.body, [{
            op: 'add',
            path: '/foo',
            value: 'bar'
          }])
          this.body = body
        })
      })
      toaBody(app)
      request(app.listen())
        .patch('/')
        .set('Content-type', 'application/json-patch+json')
        .send('[{"op": "add", "path": "/foo", "value": "bar"}]')
        .expect([{
          op: 'add',
          path: '/foo',
          value: 'bar'
        }], done)
    })

    tman.it('should json body reach the limit size', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          this.body = body
        })
      })
      toaBody(app, {
        jsonLimit: 100
      })
      request(app.listen())
        .post('/')
        .send(require(path.join(fixtures, 'raw.json')))
        .expect(413, done)
    })
  })

  tman.suite('form body', function () {
    tman.it('should parse form body ok', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.deepEqual(this.request.body, {
            foo: {
              bar: 'baz'
            }
          })
          this.body = body
        })
      })
      toaBody(app)
      request(app.listen())
        .post('/')
        .type('form')
        .send({
          foo: {
            bar: 'baz'
          }
        })
        .expect({
          foo: {
            bar: 'baz'
          }
        }, done)
    })

    tman.it('should parse form body reach the limit size', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          this.body = body
        })
      })
      toaBody(app, {
        formLimit: 10
      })
      request(app.listen())
        .post('/')
        .type('form')
        .send({
          foo: {
            bar: 'bazzzzzzz'
          }
        })
        .expect(413, done)
    })
  })

  tman.suite('extent type', function () {
    tman.it('should extent json ok', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          this.body = body
        })
      })
      toaBody(app, {
        extendTypes: {
          json: 'application/x-javascript'
        }
      })
      request(app.listen())
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({
          foo: 'bar'
        }))
        .expect({
          foo: 'bar'
        }, done)
    })

    tman.it('should extent json with array ok', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          this.body = body
        })
      })
      toaBody(app, {
        extendTypes: {
          json: ['application/x-javascript', 'application/y-javascript']
        }
      })
      request(app.listen())
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({
          foo: 'bar'
        }))
        .expect({
          foo: 'bar'
        }, done)
    })
  })

  tman.suite('other type', function () {
    tman.it('should get body null', function (done) {
      var app = Toa(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.equal(body, null)
          done()
        })
      })
      toaBody(app)
      request(app.listen())
        .get('/')
        .end(function () {})
    })
  })
})
