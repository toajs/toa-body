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

const path = require('path')
const tman = require('tman')
const assert = require('assert')
const request = require('supertest')
const Toa = require('toa')
const toaBody = require('..')

const fixtures = path.join(__dirname, 'fixtures')

tman.suite('toa-body', function () {
  tman.suite('json body', function () {
    tman.it('should parse json body ok', function () {
      const app = new Toa()
      app.use(function () {
        return this.parseBody()(function (err, body) {
          assert.strictEqual(err, null)
          assert.strictEqual(this.request.body, body)
          assert.deepEqual(this.request.body, {foo: 'bar'})
          this.body = body
        })
      })
      toaBody(app)

      return request(app.listen())
        .post('/')
        .send({foo: 'bar'})
        .expect({foo: 'bar'})
    })

    tman.it('should support middleware style', function () {
      var app = new Toa()

      app.use(toaBody())
      app.use(function () {
        assert.deepEqual(this.request.body, {foo: 'bar'})
        this.body = this.request.body
      })

      return request(app.listen())
        .post('/')
        .send({foo: 'bar'})
        .expect({foo: 'bar'})
    })

    tman.it('should parse json body with json-api headers ok', function () {
      var app = new Toa()
      app.use(function * () {
        let body = yield this.parseBody()
        assert.strictEqual(this.request.body, body)
        // should work when use body parser again
        body = yield this.parseBody()
        assert.deepEqual(this.request.body, {foo: 'bar'})
        this.body = body
      })
      toaBody(app)

      return request(app.listen())
        .post('/')
        .set('Accept', 'application/vnd.api+json')
        .set('Content-type', 'application/vnd.api+json')
        .send('{"foo": "bar"}')
        .expect({foo: 'bar'})
    })

    tman.it('should parse json patch', function () {
      var app = new Toa()
      app.use(function * () {
        let body = yield this.parseBody()
        assert.deepEqual(this.request.body, [{
          op: 'add',
          path: '/foo',
          value: 'bar'
        }])
        this.body = body
      })
      toaBody(app)

      return request(app.listen())
        .patch('/')
        .set('Content-type', 'application/json-patch+json')
        .send('[{"op": "add", "path": "/foo", "value": "bar"}]')
        .expect([{op: 'add', path: '/foo', value: 'bar'}])
    })

    tman.it('should json body reach the limit size', function () {
      var app = new Toa()
      app.use(function () {
        return this.parseBody()
      })
      toaBody(app, {
        jsonLimit: 100
      })

      return request(app.listen())
        .post('/')
        .send(require(path.join(fixtures, 'raw.json')))
        .expect(413)
    })
  })

  tman.suite('form body', function () {
    tman.it('should parse form body ok', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
        assert.deepEqual(this.body, {foo: {bar: 'baz'}})
      })
      toaBody(app)

      return request(app.listen())
        .post('/')
        .type('form')
        .send({foo: {bar: 'baz'}})
        .expect({foo: {bar: 'baz'}})
    })

    tman.it('should parse form body reach the limit size', function () {
      var app = new Toa()
      app.use(function * () {
        yield this.parseBody()
      })
      toaBody(app, {formLimit: 10})

      return request(app.listen())
        .post('/')
        .type('form')
        .send({foo: {bar: 'bazzzzzzz'}})
        .expect(413)
    })
  })

  tman.suite('extent type', function () {
    tman.it('should extent json ok', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
      })
      toaBody(app, {
        extendTypes: {
          json: 'application/x-javascript'
        }
      })

      return request(app.listen())
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({foo: 'bar'}))
        .expect({foo: 'bar'})
    })

    tman.it('should extent json with array ok', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
      })
      toaBody(app, {
        extendTypes: {
          json: ['application/x-javascript', 'application/y-javascript']
        }
      })

      return request(app.listen())
        .post('/')
        .type('application/x-javascript')
        .send(JSON.stringify({foo: 'bar'}))
        .expect({foo: 'bar'})
    })
  })

  tman.suite('custom parse', function () {
    tman.it('parse buf when no encoding', function () {
      var app = new Toa()
      app.use(function * () {
        let body = yield this.parseBody()
        assert.equal(body, 'ok')
        this.body = body
      })
      toaBody(app, {
        parse: function (buf) {
          assert.ok(buf instanceof Buffer)
          return 'ok'
        }
      })

      return request(app.listen())
        .post('/')
        .type('text')
        .send(JSON.stringify({foo: 'bar'}))
        .expect('ok')
    })

    tman.it('parse buf with encoding', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
      })
      toaBody(app, {
        encoding: 'utf8',
        parse: function (str) {
          assert.ok(typeof str === 'string')
          return str
        }
      })

      return request(app.listen())
        .post('/')
        .type('text')
        .send(JSON.stringify({foo: 'bar'}))
        .expect('{"foo":"bar"}')
    })

    tman.it('parse return promise', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
      })
      toaBody(app, {
        encoding: 'utf8',
        parse: function (str) {
          return Promise.resolve(str)
        }
      })

      return request(app.listen())
        .post('/')
        .type('text')
        .send(JSON.stringify({foo: 'bar'}))
        .expect('{"foo":"bar"}')
    })

    tman.it('parse return thunk function', function () {
      var app = new Toa()
      app.use(function * () {
        this.body = yield this.parseBody()
      })
      toaBody(app, {
        encoding: 'utf8',
        parse: function (str) {
          return function (done) { done(null, str) }
        }
      })

      return request(app.listen())
        .post('/')
        .type('text')
        .send(JSON.stringify({foo: 'bar'}))
        .expect('{"foo":"bar"}')
    })

    tman.it('parse error', function () {
      var app = new Toa()
      app.use(function () {
        return this.parseBody()
      })
      toaBody(app, {
        parse: function (str) {
          throw new Error('some error')
        }
      })

      return request(app.listen())
        .post('/')
        .type('text')
        .send(JSON.stringify({foo: 'bar'}))
        .expect(400)
    })
  })

  tman.suite('no body', function () {
    tman.it('should get null when no encoding', function () {
      var app = new Toa()
      app.use(function * () {
        let body = yield this.parseBody()
        assert.strictEqual(body, null)
        this.body = body
      })
      toaBody(app)

      return request(app.listen())
        .get('/')
        .expect(204)
    })

    tman.it('should get "" with encoding', function () {
      var app = new Toa()
      app.use(function * () {
        let body = yield this.parseBody()
        assert.strictEqual(body, '')
        this.body = body
      })
      toaBody(app, {encoding: 'utf8'})

      return request(app.listen())
        .get('/')
        .expect(200)
    })
  })
})
