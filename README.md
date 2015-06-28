toa-body
====
Request body parser for toa.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Talk topic][talk-image]][talk-url]

## [toa](https://github.com/toajs/toa)

## Demo

```js
var toa = require('toa')
var toaBody = require('toa-body')

var app = toa(function *() {
  this.body = yield this.parseBody()
})

toaBody(app)
app.listen(3000)
```

**or old style:**
```js
var toa = require('toa')
var toaBody = require('toa-body')

var app = toa(function () {
  return this.parseBody()(function(err, body) {
    this.body = body
  })
})

toaBody(app)
app.listen(3000)
```

## Installation

```bash
npm install toa-body
```

## API

```js
var toaBody = require('toa-body')
```
### toaBody(app, [options])

It will add `parseBody` method to `context`.

- `options.encode`: requested encoding. Default is `utf-8` by `co-body`
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

### context.parseBody()

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

## Licences
(The MIT License)

[npm-url]: https://npmjs.org/package/toa-body
[npm-image]: http://img.shields.io/npm/v/toa-body.svg

[travis-url]: https://travis-ci.org/toajs/toa-body
[travis-image]: http://img.shields.io/travis/toajs/toa-body.svg

[talk-url]: https://guest.talk.ai/rooms/a6a9331024
[talk-image]: https://img.shields.io/talk/t/a6a9331024.svg
