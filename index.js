'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

/**
 * modified from https://github.com/koajs/body-parser
 */

var qs = require('qs')
var raw = require('raw-body')
var thunk = require('thunks')()
var inflate = require('inflation')
var assign = Object.assign || function (target) {
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index]
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
var strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/ // eslint-disable-line

/**
 * @param [Object] opts
 *   - {String} jsonLimit default '1mb'
 *   - {String} formLimit default '56kb'
 *   - {string} encoding default 'utf8'
 *   - {Object} extendTypes
 */
module.exports = function toaBody (app, opts) {
  if (app && !app.context) {
    opts = app
    app = null
  }
  opts = opts || {}
  var extendTypes = opts.extendTypes || {}

  // default json types
  var jsonTypes = [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report'
  ]

  // default form types
  var formTypes = [
    'application/x-www-form-urlencoded'
  ]

  extendType(jsonTypes, extendTypes.json)
  extendType(formTypes, extendTypes.form)

  var jsonOpts = getOptions({jsonLimit: '1mb', encoding: 'utf8'}, opts, 'json')
  var formOpts = getOptions({jsonLimit: '56kb', encoding: 'utf8'}, opts, 'form')
  var defaultOpts = getOptions({defaultLimit: '1mb'}, opts, 'default')

  var jsonParse = getJsonParse(opts.strict !== false)
  var formParse = getFormParse(opts.qs || qs, opts.qsOptions)
  var defaultParse = opts.parse || function (value) {
    return (value instanceof Buffer && !value.length) ? null : value
  }

  function parseBody () {
    var ctx = this
    var options = defaultOpts
    var parse = defaultParse
    var body = this.request.body
    if (body !== undefined) return thunk.call(this, body)
    if (this.is(jsonTypes)) {
      parse = jsonParse
      options = jsonOpts
    } else if (this.is(formTypes)) {
      parse = formParse
      options = formOpts
    }

    body = getRawBody(this.req, options).then(function (str) {
      try {
        return parse.call(ctx, str)
      } catch (err) {
        err.status = 400
        err.body = str
        throw err
      }
    })
    return thunk.call(this, body)(function (err, res) {
      if (err != null) throw err
      ctx.request.body = res
      return res
    })
  }

  if (app) {
    if (app.context.parseBody) throw new Error('app.context.parseBody is exist!')
    app.request.body = undefined
    app.context.parseBody = parseBody
  }
  return parseBody
}

function getOptions (opts1, opts2, type) {
  var res = assign({}, opts1, opts2)
  var limit = res[type + 'Limit']
  if (limit) res.limit = limit
  return res
}

function extendType (original, extend) {
  if (extend) {
    if (!Array.isArray(extend)) extend = [extend]
    original.push.apply(original, extend)
  }
}

function getRawBody (req, opts) {
  var len = req.headers['content-length']
  var encoding = req.headers['content-encoding'] || 'identity'
  if (len && encoding === 'identity') opts.length = ~~len
  return raw(inflate(req), opts)
}

function getJsonParse (strict) {
  return function (str) {
    if (!strict) return str ? JSON.parse(str) : str
    // strict mode always return object
    if (!str) return {}
    // strict JSON test
    if (!strictJSONReg.test(str)) {
      throw new Error('invalid JSON, only supports object and array')
    }
    return JSON.parse(str)
  }
}

function getFormParse (qs, qsOptions) {
  return function (str) {
    return qs.parse(str, qsOptions)
  }
}
