'use strict'
// **Github:** https://github.com/toajs/toa-body
//
// **License:** MIT

/**
 * modified from https://github.com/koajs/body-parser
 */

const qs = require('qs')
const raw = require('raw-body')
const thunk = require('thunks')()
const inflate = require('inflation')

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/ // eslint-disable-line

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
  const extendTypes = opts.extendTypes || {}

  // default json types
  const jsonTypes = [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report'
  ]

  // default form types
  const formTypes = [
    'application/x-www-form-urlencoded'
  ]

  extendType(jsonTypes, extendTypes.json)
  extendType(formTypes, extendTypes.form)

  const jsonOpts = getOptions({jsonLimit: '1mb', encoding: 'utf8'}, opts, 'json')
  const formOpts = getOptions({jsonLimit: '56kb', encoding: 'utf8'}, opts, 'form')
  const defaultOpts = getOptions({defaultLimit: '1mb'}, opts, 'default')

  const jsonParse = getJsonParse(opts.strict !== false)
  const formParse = getFormParse(opts.qs || qs, opts.qsOptions)
  const defaultParse = opts.parse || ((value) => (value instanceof Buffer && !value.length) ? null : value)

  function parseBody () {
    let ctx = this
    let options = defaultOpts
    let parse = defaultParse
    let body = this.request.body
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
  let res = Object.assign({}, opts1, opts2)
  let limit = res[type + 'Limit']
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
  let len = req.headers['content-length']
  let encoding = req.headers['content-encoding'] || 'identity'
  if (len && encoding === 'identity') opts.length = ~~len
  return raw(inflate(req), opts)
}

function getJsonParse (strict) {
  return (str) => {
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
  return (str) => qs.parse(str, qsOptions)
}
