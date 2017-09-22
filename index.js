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
    this.host = config.host
    this.key = config.key
    this.secret = config.secret
    this.country = config.country
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
    let _encryptedStr = `${time.toString()}\r\n${method}\r\n${path}\r\n\r\n`
    if (method !== 'GET') {
      let _body = JSON.stringify(body)
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

  /**
   * Get the status of an order through endpoint of lalamove api
   * @param {String} customerOrderId 
   * @return {Q<Object>} Promise object of superagent
   */
  getOrderStatus(orderId) {
    let _path = `/v2/orders/${orderId}`
    return sagent.get(this.host + _path)
      .set(this.getHeader('GET', _path))
  }

  /**
   * Get the driver information after the order is picked up through
   * endpoint of lalamove api
   * @param {String} customerOrderId
   * @param {String} driverId
   * @return {Q<Object>} promise object of superagent
   */
  getDriverInfo(orderId, driverId) {
    let _path = `/v2/orders/${orderId}/drivers/${driverId}`
    return sagent.get(this.host + _path)
      .set(this.getHeader('GET', _path))
  }

  /**
   * Get the driver location ater the order is picked up through
   * endpoint of lalamove api
   * @param {String} customerOrderId
   * @param {String} driverId
   * @return {Q<String>} promise object of superagent
   */
  getDriverLocation(orderId, driverId) {
    let _path = `/v2/orders/${orderId}/drivers/${driverId}/location`
    return sagent.get(this.host + _path)
      .set(this.getHeader('GET', _path))
  }
}

module.exports = (config) => {
  if (!config || (!config.key || !config.host || !config.secret || !config.country))
    throw new Error('configuration file not passed in')
  return new Lalamove(config)
}
