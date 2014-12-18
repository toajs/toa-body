toa-body v1.0.2 [![Build Status](https://travis-ci.org/toajs/toa-body.svg)](https://travis-ci.org/toajs/toa-body)
====
Request body parser for toa.

## [toa](https://github.com/toajs/toa)

## Demo

```js
var Toa = require('toa');
var Router = require('toa-router');
var BodyParser = require('toa-body');

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
```

**using generator:**

```js
var Toa = require('toa');
var Router = require('toa-router');
var BodyParser = require('toa-body');

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
```

## Installation

```bash
npm install toa-body
```

## API

```js
var BodyParser = require('toa-body');
```
### bodyParser = BodyParser([options])

- `options.encode`: requested encoding. Default is `utf-8` by `co-body`
- `options.formLimit`: limit of the `urlencoded` body. If the body ends up being larger than this limit, a 413 error code is returned. Default is `56kb`
- `options.jsonLimit`: limit of the `json` body. Default is `1mb`
- `options.extendTypes`: support extend types:

```js
var bodyParser = BodyParser({
  extendTypes: {
    json: ['application/x-javascript'] // will parse application/x-javascript type body as a JSON string
  }
}));
```

### bodyParser(request, Thunk)

Return thunk.

```js
bodyParser.call(this, this.request, Thunk)(function (err, body) {
  this.body = body;
});
```

```js
this.body = yield bodyParser(this.request, Thunk);
```

## Licences
(The MIT License)
