'use strict'

const sagent = require('superagent'),
      cryptoJS = require('crypto-js'),
      uuid = require('uuid')

class Lalamove {
  /**
   * Constructor for setting the host, key, secret and country
   * @param {Object} object with key host, key, secret and country
   *   - host (e.g. https://sandbox-rest.lalamove.com)
   *   - key our api key
   *   - secret our api secret
   *   - country (country code such as TH, SG, HK, PH, TW)
   */
  constructor(config) {
    this.host = config.host || ''
    this.key = config.key || ''
    this.secret = config.secret || ''
    this.country = config.country || ''
  }

  /**
   * Create a signature based on lalamove's requirement to use in the header
   * @param {Int} time
   * @param {String} path such as /v2/quotation
   * @param {Object} JSON body
   * @param {String} method all in capital letter (POST, GET, PATCH, DELETE, PUT)
   * @return {String} signature of the request
   */
  getSignature(time, path, body, method) {
    let _body = JSON.stringify(body)
    let _encryptedStr = `${time.toString()}\r\n${method}\r\n${path}\r\n\r\n`
    if (method !== 'GET') {
      _encryptedStr = _encryptedStr + _body
    }
    return cryptoJS.HmacSHA256(_encryptedStr, this.secret)
  }

  /**
   * Create header for the user
   * @param {String} method all in capital letter (POST, GET, PATCH, DELETE, PUT)
   * @param {String} path such as /v2/quotation
   * @param {Object} JSON body
   * @param {Object} header for Lalamove Restful http request
   */
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

  /**
   * Call a quotation endpoint of lalamove api
   * @param {Object} Json Object parameters
   * @return {Q<Object>} promise object of superagent
   */
  quotation(body) {
    let _path = '/v2/quotations'
    return sagent.post(this.host + _path)
      .set(this.getHeader('POST', _path, body))
      .send(body)
  }

  /**
   * Call place order endpoint of lalamove api
   * @param {Object} Json Object parameters
   * @return {Q<Object>} promise object of superagent
   */
  postOrder(body) {
    let _path = '/v2/orders'
    return sagent.post(this.host + _path)
      .set(this.getHeader('POST', _path, body))
      .send(body)
  }

  /**
   * Cancel order endpoint of lalamove api
   * @param {String} orderId of the order to cancel
   * @return {Q<Object>} promise object of superagent
   */
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
