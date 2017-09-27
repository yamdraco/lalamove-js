'use strict'

const axios = require('axios'),
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
   * @param {Object} header for Lalamove Restful http axios
   */
  getHeader(method, path, body) { 
    const time = new Date().getTime()
    return {
      'X-Request-ID': uuid.v4(),
      'Content-type': 'application/json; charset=utf-8',
      'Authorization': `hmac ${this.key}:${time}:${this.getSignature(time, path, body, method)}`,
      'Accept': 'application/json',
      'X-LLM-Country': this.country
    }
  }

  /**
   * Call a quotation endpoint of lalamove api
   * @param {Object} Json Object parameters
   * @return {Q<Object>} promise object of axios
   */
  quotation(body) {
    const _path = '/v2/quotations'
    const method = 'POST'
    return axios.post(this.host + _path, body, {
      headers: this.getHeader(method, _path, body)
    })
  }

  /**
   * Call place order endpoint of lalamove api
   * @param {Object} Json Object parameters
   * @return {Q<Object>} promise object of axios
   */
  postOrder(body) {
    const _path = '/v2/orders'
    const method = 'POST'
    return axios.post(this.host + _path, body, {
      headers: this.getHeader(method, _path, body)
    })
  }

  /**
   * Cancel order endpoint of lalamove api
   * @param {String} orderId of the order to cancel
   * @return {Q<Object>} promise object of axios
   */
  cancelOrder(orderId) {
    const _path = `/v2/orders/${orderId}/cancel`
    const body = {}
    return axios.put(this.host + _path, body, {
      method: 'PUT',
      headers: this.getHeader('PUT', _path, body)
    })
  }

  /**
   * Get the status of an order through endpoint of lalamove api
   * @param {String} customerOrderId 
   * @return {Q<Object>} Promise object of axios
   */
  getOrderStatus(orderId) {
    const _path = `/v2/orders/${orderId}`
    return axios.get(this.host + _path, {
      method: 'GET',
      headers: this.getHeader('GET', _path, '')
    })
  }

  /**
   * Get the driver information after the order is picked up through
   * endpoint of lalamove api
   * @param {String} customerOrderId
   * @param {String} driverId
   * @return {Q<Object>} promise object of axios
   */
  getDriverInfo(orderId, driverId) {
    const _path = `/v2/orders/${orderId}/drivers/${driverId}`
    return axios.get(this.host + _path, {
      method: 'GET',
      headers: this.getHeader('GET', _path, '')
    })
  }

  /**
   * Get the driver location ater the order is picked up through
   * endpoint of lalamove api
   * @param {String} customerOrderId
   * @param {String} driverId
   * @return {Q<String>} promise object of axios
   */
  getDriverLocation(orderId, driverId) {
    const _path = `/v2/orders/${orderId}/drivers/${driverId}/location`
    return axios.get(this.host + _path, {
      method: 'GET',
      headers: this.getHeader('GET', _path, '')
    })
  }
}

module.exports = (config) => {
  if (!config || (!config.key || !config.host || !config.secret || !config.country)) {
    throw new Error('configuration file not passed in')        
  }
  return new Lalamove(config)
}
