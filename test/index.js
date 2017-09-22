/* global describe, it */
/**
 *
 * Test cases for Lalamove API
 *
 */
'use strict'

const assert = require('chai').assert,
      config = {
        host: 'https://sandbox-rest.lalamove.com',
        key: '70f1d37a23294d118227a29b3ea90c3c',
        secret: 'MCwCAQACBQC9gIh5AgMBAAECBQClUTftAgMA3ecCAwDanwICKLcCAgFZAgJFeg==',
        country: 'SG'
      }

let makeId = () => {
  let text = ''
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

describe('Lalamove API', () => {
  let body = {
    'serviceType': 'MOTORCYCLE',
    'specialRequests': [],
    'requesterContact': {
        'name': 'Draco Yam',
        'phone': '+6592344758'
    },
    'stops': [
        {
            'location': {'lat': '1.284318', 'lng': '103.851335'},
            'addresses': {
                'en_SG': {
                    'displayString': '1 Raffles Place #04-00, One Raffles Place Shopping Mall, Singapore',
                    'country': 'SG'
                }
            }
        },
        {
            'location': {'lat': '1.278578', 'lng': '103.851860'},
            'addresses': {
                'en_SG': {
                    'displayString': 'Asia Square Tower 1, 8 Marina View, Singapore',
                    'country': 'SG'
                }
            }
        }
    ],
    'deliveries': [
        {
            'toStop': 1,
            'toContact': {
                'name': 'Brian Garcia',
                'phone': '+6592344837'
            },
            'remarks': 'ORDER #: 1234, ITEM 1 x 1, ITEM 2 x 2'
        }
    ]
  }

  it('should be able to throw error if a config is not passed in', () => {
    assert.throws(require('../index'), Error, 'configuration file not passed in')
  })

  it('should be able to throw 401 error for invalid key', () => {
    const lalamove = require('../index')({
      host: 'https://sandbox-rest.lalamove.com'
    , key: 'abc123'
    , secret: 'abc123'
    , country: 'SG'
    })
    return lalamove.quotation(body).then(() => {
      assert.equal('should not be able to call here', '')
    }).catch((e) => {
      assert.equal(e.status, 401)
    })
  })

  let _quotation
  it('should be able to get quotation', () => {
    const lalamove = require('../index')(config)
    body.scheduleAt = new Date(new Date().getTime() + 10 * 60000).toISOString()
    return lalamove.quotation(body).then((result) => {
      _quotation = result.body
      assert.isDefined(result.body.totalFee)
      assert.isDefined(result.body.totalFeeCurrency)
    })
  })

  let _order
  it('should be able to post order', () => {
    const lalamove = require('../index')(config)
    body.quotedTotalFee = {
      amount: _quotation.totalFee
    , currency: _quotation.totalFeeCurrency
    }
    body.deliveries[0].remarks += makeId()
    return lalamove.postOrder(body).then((result) => {
      _order = result.body
      assert.isDefined(result.body.customerOrderId)
      assert.isDefined(result.body.orderRef)
    })
  })

  it('should be able to get order status', () => {
    const lalamove = require('../index')(config)
    return lalamove.getOrderStatus(_order.customerOrderId).then((result) => {
      assert.isDefined(result.body.driverId)
      assert.isDefined(result.body.status)
    })
  })

  it('should be able to get driver Info', () => {
    const lalamove = require('../index')(config)
    return lalamove.getDriverInfo('c5e80dec-9f44-11e7-a723-06bff2d87e1b', '20128').then((result) => {
      assert.isDefined(result.body.name)
      assert.isDefined(result.body.phone)
    })
  })

  it('should be able to get driver location', () => {
    const lalamove = require('../index')(config)
    return lalamove.getDriverLocation('3dc4959b-8705-11e7-a723-06bff2d87e1b', '21712').then((result) => {
      assert.isDefined(result.body.location)
      assert.isDefined(result.body.updatedAt)
    })
  })

  it('should be able to cancel order', () => {
    const lalamove = require('../index')(config)
    return lalamove.cancelOrder(_order.customerOrderId).then((result) => {
      assert.equal(result.status, 200)
    })
  })
})
