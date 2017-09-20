'use strict'

const sagent = require('superagent'),
      cryptoJS = require('crypto-js'),
      uuid = require('uuid')

class Lalamove {
  constructor(config) {
    this.host = config.host || ''
    this.key = config.key || ''
    this.secret = config.secret || ''
    this.country = config.country || ''
  }

  getSignature(time, path, body, method) {
    let _body = JSON.stringify(body)
    let _encryptedStr = `${time.toString()}\r\n${method}\r\n${path}\r\n\r\n`
    if (method !== 'GET') {
      _encryptedStr = _encryptedStr + _body
    }
    return cryptoJS.HmacSHA256(_encryptedStr, this.secret)
  }

  getHeader(method, path, body) { 
    let time = new Date().getTime()
    return {
      'X-Request-ID': uuid.v4(),
      'Content-type': 'application/json; charset=utf-8',
      'Authorization': 'hmac ' + this.key + ':' + time + ':' + this.getSignature(time, path, body, method),
      'Accept': 'application/json',
      'X-LLM-Country': this.country
    }
  }

  quotation(body) {
    let _path = '/v2/quotations'
    return sagent.post(this.host + _path)
      .set(this.getHeader('POST', _path, body))
      .send(body)
  }

  postOrder(body) {
    let _path = '/v2/orders'
    return sagent.post(this.host + _path)
      .set(this.getHeader('POST', _path, body))
      .send(body)
  }

  cancelOrder(orderId) {
    let _path = `/v2/orders/${orderId}/cancel`,
        body = {}
    return sagent.put(this.host + _path)
      .set(this.getHeader('PUT', _path, body))
      .send(body)
  }
}

module.exports = (config) => {
  return new Lalamove(config || {})
}
