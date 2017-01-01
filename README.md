toa-body
====
Request body parser for toa.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## [toa](https://github.com/toajs/toa)

## Demo

```js
const Toa = require('toa')
const toaBody = require('toa-body')

const app = new Toa()
toaBody(app)

app.use(function * () {
  this.body = yield this.parseBody()
})
app.listen(3000)
```

```js
const Toa = require('toa')
const toaBody = require('toa-body')

const app = new Toa()
app.use(toaBody()) //  It will try to parse body for every request.

app.use(function () {
  this.body = yield this.request.body
})
app.listen(3000)
```

## Installation

```bash
npm install toa-body
```

## API

```js
const toaBody = require('toa-body')
```
### toaBody(app[, options])

It will add `parseBody` method to `context`.

- `options.encoding`: requested encoding. Default is `utf8`.
- `options.formLimit`: limit of the `urlencoded` body. If the body ends up being larger than this limit, a 413 error code is returned. Default is `56kb`
- `options.jsonLimit`: limit of the `json` body. Default is `1mb`
- `options.extendTypes`: support extend types:
```js
toaBody(app, {
  extendTypes: {
    json: ['application/x-javascript'] // will parse application/x-javascript type body as a JSON string
  }
}))
```
- `options.parse`: support custom parse:
```js
const parseXml = require('xml2js').parseString

toaBody(app, {
  parse: function (buf) {
    var str = buf.toString('utf8')
    if (!this.is('text/xml')) return str
    // return promise or thunk function for async task
    return function (done) { parseXml(str, done) }
  }
}))
```

#### context.parseBody()

return thunk function.

```js
this.body = yield this.parseBody()
```

```js
this.parseBody()(function (err, body) {
  // this.request.body === body
  this.body = body
})
```

### app.use(toaBody([options]))

Toa>=v1.8.0 required.

## Licences
(The MIT License)

[npm-url]: https://npmjs.org/package/toa-body
[npm-image]: http://img.shields.io/npm/v/toa-body.svg

[travis-url]: https://travis-ci.org/toajs/toa-body
[travis-image]: http://img.shields.io/travis/toajs/toa-body.svg

[downloads-url]: https://npmjs.org/package/toa-body
[downloads-image]: http://img.shields.io/npm/dm/toa-body.svg?style=flat-square
