[![Build Status](https://travis-ci.org/yamdraco/lalamove-js.svg?branch=master)](https://travis-ci.org/yamdraco/lalamove-js)
[![Coverage Status](https://coveralls.io/repos/github/yamdraco/lalamove-js/badge.svg?branch=master)](https://coveralls.io/github/yamdraco/lalamove-js?branch=master)

# Lalamove Unofficial Client Library for Node.js

## Getting Started

### Prerequisites
* Node.js (version 4.x or above)

## Installation
Install this library via npm:
```
npm install lalamove-js
```

## General Order Flow
1. Get quotation for the delivery
2. Place order with the quotation returned in Step 1
3. Check the order status / Cancel Order

## Usage
> You must obtain Lalamove Sandbox API credential from Lalamove Sales Representative to kickstart your integration process.

Step 1: Instantiate a Lalamove object

```javascript
var lalamove = require('./index') ({
  host: 'https://sandbox-rest.lalamove.com',
  key: '12345',      // Obtained from Lalamove Sales Team
  secret: '12345',   // Obtained from Lalamove Sales Team
  country: 'SG'
})
```

### Order Quotation
Step 1: Set body for order quotation

```javascript
var body = {
    'serviceType': 'MOTORCYCLE',
    'scheduleAt': '2018-06-13T12:00:00:00Z' // Note: This is in UTC Timezone
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

```

`serviceType` - The mode of delivery

`scheduleAt` - The pickup time of the delivery

`specialRequests` - Extra handling requests for the delivery
> Contact Lalamove Sales Team to learn more about available **service types** & **special requests** in your city.

`requestorContact` - This is the contact information of the person who is placing the order. Once a driver is matched with the order, the driver will contact the order placer via this number.
> Note: This information will also be mapped to the contact person of first location.

> Note on phone number format: There is a '0' between the international code and phone number for all countries except HK and SG (e.g. +66**0**20345252 for Thailand)

`stops` - This is an array of stops. The first stop is the goods pickup location. The first delivery location start from the second stop.
> `location` can be omitted if latitude-longitude pair is not available. `displayString` will be used to geocode the location.

`deliveries` - This is an array of contact information of each delivery stop. Please note: `toStop` of 1 maps to the second stop in `stops`.

Step 2: Call Quotation Method
```javascript
  var quotation = lalamove.quotation(body)
    .then(function (response) {
      return response
    })
```
The response should be returned with the follow fields:
```
  {
    "totalFeeCurrency": "SGD",
    "totalFee": "10"
  }
```
### Order Placing
Step 1: Using the **same body** as order quotation, add the following attributes to the JSON body:
```javascript
'quotedTotalFee': {
  "amount": "10",
  "currency": "SGD"
},
'callerSideCustomerId': ''  // Optional
```

`quotedTotalFee` - This must be the same price as the price returned from the quotation endpoint in the previous step.

`callerSideCustomerId` - [Optional] This is used for inputting a tracking ID if you have one. This information will be shown to driver for order and goods verification purposes.

Step 2: Call postOrder Method
```javascript
  var postedOrder = lalamove.postOrder(body)
    .then(function (response) {
      return response
    })
```
The response should be returned with the follow fields:
```
  {
    "customerOrderId": "a6378ec5-6ef1-11e8-a733-06bff2d87e1b",
    "orderRef": "130343"
  }
```

`customerOrderId` - A unique order identifier used in system communications

`orderRef` - A unique order identifier used for communications with Lalamove Customer Service.

### Order Status

An order can have these order statuses: `ASSIGNING_DRIVER`, `ON_GOING`,  `PICKED_UP`, `COMPLETE`, `CANCELED`, `REJECTED`, `EXPIRED`

```javascript
  var orderStatus = lalamove.getOrderStatus(customerOrderId)
    .then(function (response) {
      return response
    })
```
The response should be returned with the follow fields:
```
  {
    "driverId": "",
    "status": "ASSIGNING_DRIVER"
  }
```

### Driver Contact Information

Once the order is matched, you can get the contact information of the driver.

```javascript
  var driverInfo = lalamove.getDriverInfo(customerOrderId, driverId)
    .then(function (response) {
      return response
    })
```
The response should be returned with the follow fields:
```
  {
    "name": "David",
    "phone": "+6592344758"
  }
```

### Driver Location

Once the order is matched, you can get the location of the driver.

```javascript
  var driverInfo = lalamove.getDriverInfo(customerOrderId, driverId)
    .then(function (response) {
      return response
    })
```
The response should be returned with the follow fields:
```
  {
    "location": { "lat": "13.740167", "lng": "100.535237" },
    "updatedAt": "2017-12-01T14:30.00Z"
  }
```

### Cancel Order

You can cancel the order anytime before a driver is matched with the order and 5 minutes after the driver is matched.
> Note that this is the time when driver is matched, not the time when the order status is called.

```javascript
  var driverInfo = lalamove.getDriverInfo(customerOrderId, driverId)
    .then(function (response) {
      return response
    })
```

## Library Maintenance
This library is an unofficial library for Lalamove api. Currently we are fixing all necessary bug and adding essential features to ensure the library continues to meet your needs in accessing the Lalamove APIs. Non-critical issues will be closed. Any issue may be reopened if it is causing ongoing problem.


## How to submit a bug, issue or feature request
If you wish to submit a bug, issue, or feature request, then you can find the [issue here](https://github.com/yamdraco/lalamove-js/issues) and you can [create one here](https://github.com/yamdraco/lalamove-js/issues/new). For bug reporting, make sure you provide the following information
1. Your node version and framework (if any)
2. Your country and locale
3. Clear steps to reproduce the bug (mainly header and body and url)
4. A description of **what you expected to happen**
5. A description of **what actually happened**

## Releases
### 20171107 (v1.0.0)
* By Draco, Alpha
* Quotation, Place Order, Cancel API
* Get Order Info, Driver Info, Location API
* Continuous Integration setup
