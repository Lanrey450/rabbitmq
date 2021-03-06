/* eslint-disable default-case */
/* eslint-disable no-fallthrough */
/* eslint-disable no-duplicate-case */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-empty */
/* eslint-disable indent */
/* eslint-disable prefer-template */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-tabs */

const TerraLogger = require('terra-logger')
const uuid = require('uuid4')
const Utils = require('../../lib/utils')

const ResponseManager = require('../../commons/response')
const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi')
const config = require('../../config')
const publish = require('../../rabbitmq/producer')


module.exports = {
  async subscribe(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['msisdn', 'product_id']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        productid: req.body.product_id,
      }
      try {
        const subscribedResponse = await MTNSDPAPIHandler.subscribe(
          sanitized_msisdn,
          data,
        )

        // reformat data to push to MTN queue
        const dataToPush = {
          msisdn: sanitized_msisdn,
          status: 'success',
          meta: {
            ResultCode: subscribedResponse.ResultCode,
            ResultDesc: subscribedResponse.ResultDesc,
          },
          action: config.request_type.sub,
          network: 'mtn',
          serviceId: data.productid,
          message: subscribedResponse.ResultDetails,
        }

        const MTNStatusCode = subscribedResponse.ResultDesc

        switch (MTNStatusCode) {
          case '22007233': {
            const { msisdn } = req.body
            const serviceId = data.productid
            // we do not push duplicate records to the queue
            return MTNSDPAPIHandler.getSubscriptionStatus(msisdn, serviceId)
              .then((subRecord) => {
                console.log(subRecord, '-------sub record')
                if (subRecord === null) {
                  return publish(config.rabbit_mq.mtn.subscription_queue, {
                    ...dataToPush,
                  }).then(() => {
                    TerraLogger.debug(
                      'successfully pushed to the Airtel subscription data queue',
                    )
                    return ResponseManager.sendResponse({
                      res,
                      responseBody: dataToPush,
                    })
                  })
                }
                return ResponseManager.sendResponse({
                  res,
                  responseBody: dataToPush,
                })
              })
              .catch(() => {
                TerraLogger.debug()
              })
          }
          case '22007203': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007201': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case MTNStatusCode >= '10000000' && MTNStatusCode <= '10009999': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007203': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007014': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007238': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007306': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007206': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          case '22007011': {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
          default: {
            return ResponseManager.sendErrorResponse({
              res,
              message: `${subscribedResponse.ResultDetails}`,
            })
          }
        }
      } catch (error) {
        return ResponseManager.sendErrorResponse({
          res,
          message: `Subscription request failed ${error}`,
        })
      }
    } else {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'Forbidden, bad authentication provided!',
      })
    }
  },

  async unsubscribe(req, res) {
    const auth = req.headers.authorization
    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    console.log('UNSUBCRIBE BODY', req.body, ' UNSUBCRIBE BODY END')
    const requiredParams = ['msisdn', 'product_id']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }

    const authDetails = auth.split(' ')

    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        productid: req.body.product_id,
      }

      try {
        const UnSubscribedResponse = await MTNSDPAPIHandler.unsubscribe(
          sanitized_msisdn,
          data,
        )

        const dataToPush = {
          msisdn: sanitized_msisdn,
          status: 'success',
          meta: {
            ResultCode: UnSubscribedResponse.ResultCode,
            ResultDesc: UnSubscribedResponse.ResultDesc,
          },
          action: config.request_type.unsub,
          network: 'mtn',
          serviceId: data.productid,
          message: UnSubscribedResponse.ResultDetails,
        }

        // try {
        // await publish(config.rabbit_mq.mtn.un_subscription_queue, { ...dataToPush })
        // 	.then(() => {
        // 		TerraLogger.debug('successfully pushed to the MTN unsubscription data queue')
        return ResponseManager.sendResponse({
          res,
          responseBody: dataToPush,
        })
        // })
        // } catch (err) {
        // 	return ResponseManager.sendErrorResponse({
        // 		res,
        // 		message: `Unable to push unsubscription request data to queue, ${err}`,
        // 	})
        // }
      } catch (error) {
        return ResponseManager.sendErrorResponse({
          res,
          message: 'Unsubscription request failed',
          responseBody: error,
        })
      }
    } else {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'Forbidden, bad authentication provided!',
      })
    }
  },

  async status(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const { msisdn, serviceId } = req.query

    const requiredParams = ['msisdn', 'serviceId']
    const missingFields = Utils.authenticateParams(req.query, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for query request:  ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')

    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()

    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword == config.userAuth.password
    ) {
      try {
        const subscriptionDetail = await MTNSDPAPIHandler.getSubscriptionStatus(
          msisdn,
          serviceId,
        )
        if (subscriptionDetail) {
          return ResponseManager.sendResponse({
            res,
            responseBody: subscriptionDetail.action,
          })
        }
      } catch (error) {
        return ResponseManager.sendErrorResponse({
          res,
          message: `Unable to get subscription status for user with error,  ${error}`,
        })
      }
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  // 	async MTNDataSyncPostBack(req, res) {
  // 		TerraLogger.debug('getting data sync feedback from mtn')
  // 		const data = req.body
  // 		// TerraLogger.debug(data)

  // 		// process mtn feedback here
  // 		const resp = data.soapenvBody.ns2notifySmsReception

  // // console.log(resp)

  // const payload = data.soapenvHeader.ns1NotifySOAPHeader

  // // const ns2extensionInfo = resp.ns2syncOrderRelation.ns2extensionInfo

  // // console.log(payload)

  // // const selectedFields = ['cycleEndTime', 'serviceAvailability', 'Starttime', 'keyword', 'fee', 'transactionID']
  // // 		const result = {}

  // // 		// loop through array and get the selected fields
  // // 		ns2extensionInfo.item.forEach((elem) => {
  // // 			if (selectedFields.includes(elem.key)) {
  // // 				result[elem.key] = elem
  // // 			}
  // // 		})

  // 		// reformat mtn data to be sent to queue
  // // 		const {
  // //  cycleEndTime, serviceAvailability, Starttime, keyword, fee, transactionID,
  // // } = result

  // 		const dataToSend = {
  // 			msisdn: resp.ns2message.senderAddress,
  // 			status: 'success',
  // 			meta: {
  // 				updateTime: payload.ns1timeStamp || '',
  // 				effectiveTime: resp.ns2message.dateTime || '',
  // 				// expiryTime: payload.ns2expiryTime || '',
  // 				// serviceAvailability: (serviceAvailability) ? serviceAvailability.value : '',
  // 				// fee: (fee) ? fee.value : '',
  // 				// keyword: (keyword) ? keyword.value : '',
  // 				// cycleEndTime: (cycleEndTime) ? cycleEndTime.value : '',
  // 				// Starttime: (Starttime) ? Starttime.value : '',
  // 			},
  // 			network: 'mtn',
  // 			serviceId: payload.ns1serviceId,
  // 			message: resp.ns2message.message,
  // 			// transactionId: (transactionID) ? transactionID.value : '',
  // 		}

  //     console.log(dataToSend)

  // 		if (dataToSend.message.includes('Bdand')) {
  // 			return publish(config.rabbit_mq.mtn.subscription_postback_queue, { ...dataToSend })
  // 			.then(() => {
  // 				TerraLogger.debug('successfully pushed postback data to queue')
  // 				return ResponseManager.sendResponse({
  // 					res,
  // 					message: 'successfully pushed MTN-Postback data to queue',
  // 				})
  // 			}).catch((err) => ResponseManager.sendErrorResponse({
  // 					res,
  // 					message: `Unable to push postback data to queue, ${err}`,
  // 				}))
  // 		}
  // 		return publish(config.rabbit_mq.mtn.un_subscription_queue, { ...dataToSend })
  // 			.then(() => {
  // 				TerraLogger.debug('successfully pushed postback data to queue')
  // 				return ResponseManager.sendResponse({
  // 					res,
  // 					message: 'successfully pushed MTN-Postback data to queue',
  // 				})
  // 			}).catch((err) => ResponseManager.sendErrorResponse({
  // 					res,
  // 					message: `Unable to push postback data to queue, ${err}`,
  // 				}))
  // 	},
  // add a consumer that would do the same thing -

  async MTNDataSyncPostBack(req, res) {
    TerraLogger.debug('getting data sync feedback from mtn')
    const data = req.body
    TerraLogger.debug(data)

    // process mtn feedback here
    const resp = data.soapenvBody

    console.log(resp)

    const payload = resp.ns2syncOrderRelation
      ? resp.ns2syncOrderRelation
      : resp.ns1syncOrderRelation

    console.log(payload)

    const ns2extensionInfo = resp.ns2syncOrderRelation
      ? resp.ns2syncOrderRelation.ns2extensionInfo
      : resp.ns1syncOrderRelation
      ? resp.ns1syncOrderRelation.ns1extensionInfo
      : resp.ns1syncOrderRelation.ns1extensionInfo

    // console.log(ns2extensionInfo)

    const selectedFields = [
      'cycleEndTime',
      'serviceAvailability',
      'Starttime',
      'keyword',
      'fee',
      'transactionID',
    ]
    const result = {}

    // loop through array and get the selected fields
    ns2extensionInfo.item.forEach((elem) => {
      if (selectedFields.includes(elem.key)) {
        result[elem.key] = elem
      }
    })

    // reformat mtn data to be sent to queue
    const {
      cycleEndTime,
      serviceAvailability,
      Starttime,
      keyword,
      fee,
      transactionID,
    } = result

    const dataToSend = {
      msisdn: payload.ns1userID ? payload.ns1userID.ID : payload.ns2userID.ID,
      status: 'success',
      meta: {
        updateTime: payload.ns1updateTime
          ? payload.ns1updateTime
          : payload.ns2updateTime || '',
        effectiveTime: payload.ns1effectiveTime
          ? payload.ns1effectiveTime
          : payload.ns2effectiveTime || '',
        expiryTime: payload.ns1expiryTime
          ? payload.ns1expiryTime
          : payload.ns2expiryTime || '',
        serviceAvailability: serviceAvailability
          ? serviceAvailability.value
          : '',
        fee: fee ? fee.value : '',
        keyword: keyword ? keyword.value : '',
        cycleEndTime: cycleEndTime ? cycleEndTime.value : '',
        Starttime: Starttime ? Starttime.value : '',
      },
      network: 'mtn',
      serviceId: payload.ns1productID
        ? payload.ns1productID
        : payload.ns2productID,
      message: payload.ns1updateDesc
        ? payload.ns1updateDesc
        : payload.ns2updateDesc,
      transactionId: transactionID ? transactionID.value : '',
    }

    console.log(dataToSend)

    if (
      dataToSend.message === 'Addition'
      || dataToSend.message === 'Modification'
    ) {
      dataToSend.subType = dataToSend.message === 'Modification' ? 'RENEWAL' : 'NEW'
      console.log('Final |Data To Send', dataToSend)
      return publish(config.rabbit_mq.mtn.subscription_postback_queue, {
        ...dataToSend,
      })
        .then(() => {
          TerraLogger.debug('successfully pushed postback data to queue')
          return ResponseManager.sendResponse({
            res,
            message: 'successfully pushed MTN-Postback data to queue',
          })
        })
        .catch((err) => ResponseManager.sendErrorResponse({
            res,
            message: `Unable to push postback data to queue, ${err}`,
          }))
    }

    return publish(config.rabbit_mq.mtn.un_subscription_queue, {
      ...dataToSend,
    })
      .then(() => {
        TerraLogger.debug('successfully pushed postback data to queue')
        return ResponseManager.sendResponse({
          res,
          message: 'successfully pushed MTN-Postback data to queue',
        })
      })
      .catch((err) => ResponseManager.sendErrorResponse({
          res,
          message: `Unable to push postback data to queue, ${err}`,
        }))
  },
  async sendSms(req, res) {
    TerraLogger.debug('calling send sms API')
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['msisdn', 'message', 'external_id', 'shortcode']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        externalId: req.body.external_id,
        msisdn: sanitized_msisdn,
        shortcode: req.body.shortcode,
        notifyUrl: config.mtn.notifyUrl.sms_dlr, // add another endpoint notification url drl
        message: req.body.message,
      }
      try {
        //  check if the serviceId exists for the user subscription before attempting to send an sms to the user
        await MTNSDPAPIHandler.sendSmsMT(data)
        return ResponseManager.sendErrorResponse({
          res,
          message: 'SMS has been accepted for delivery',
        })
      } catch (error) {
        return ResponseManager.sendErrorResponse({
          res,
          message: `Send SMS request has failed with ${error}`,
        })
      }
    } else {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'Forbidden, bad authentication provided!',
      })
    }
  },

  async stopUssdMo(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['correlatorId', 'serviceId']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        serviceId: req.body.serviceId,
        correlatorId: req.body.correlatorId, // make an API call to get this based on the serviceID
      }

      const response = await MTNSDPAPIHandler.stopUssdMo(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `USSD notifcation stopped successfully for ${data.correlatorId}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Stop USSD notification request failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async startUssdMo(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['correlatorId', 'serviceId', 'serviceNumber']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        notifyUrl: config.mtn.notifyUrl.ussd,
        serviceId: req.body.serviceId,
        serviceNumber: req.body.serviceNumber,
        correlatorId: req.body.correlatorId, // make an API call to get this based on the serviceID
      }

      const response = await MTNSDPAPIHandler.startUssdMo(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `USSD notifcation started successfully with ${data.correlatorId}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Start USSD notification request failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async startSMSNotification(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = [
      'correlatorId',
      'external_id',
      'shortcode',
      'criteria',
    ]
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        // notifyUrl: config.mtn.notifyUrl.sms,
        notifyUrl: config.mtn.notifyUrl.startSMSNotificationUrl,
        serviceId: req.body.external_id,
        shortcode: req.body.shortcode,
        criteria: req.body.criteria,
        correlatorId: req.body.correlatorId,
      }
      console.log(data, 'data')
      const response = await MTNSDPAPIHandler.startSmsMo(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `SMS notifcation started successfully with ${data.correlatorId}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Start SMS notification request failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async stopSMSNotification(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['correlatorId', 'serviceId']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        serviceId: req.body.serviceId,
        correlatorId: req.body.correlatorId, // make an API call to get this based on the serviceID
      }
      const response = await MTNSDPAPIHandler.stopSmsMo(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `SMS notifcation stopped successfully for ${data.correlatorId}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Stop SMS notification request failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async sendUssd(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['msisdn', 'message', 'service_id', 'shortcode']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        serviceId: req.body.service_id,
        option_type: req.body.option_type,
        msisdn: sanitized_msisdn,
        shortcode: req.body.shortcode,
        ussd_string: req.body.ussd_string,
        linkid: req.body.linkid || '12345678901111',
      }

      const response = await MTNSDPAPIHandler.sendUssd(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: 'USSD has been accepted for delivery',
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `send USSD request has failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async welcome(req, res) {
    const {
      serviceCode,
      accessCode,
      network,
      msisdn,
      sessionId,
      string,
      command,
    } = req.body

    console.log(
      'sample ussd app request -',
      req.body,
      ' - sample ussd app request',
    )

    let defaultString = 'Welcome to Provider Product'
    let defaultCommand = 'Continue'
    if (string == 'endussd' || command == 'endussd') {
      defaultString = 'You have ended the session'
      defaultCommand = 'Terminate'
    }

    const responseData = {
      string: defaultString,
      serviceCode,
      accessCode,
      command: defaultCommand,
      network,
      msisdn,
      sessionId,
    }
    return ResponseManager.sendResponse({
      res,
      message: 'Successful',
      responseBody: responseData,
    })
  },

  async authorizePayment(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['msisdn', 'amount', 'productName', 'serviceId']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        serviceId: req.body.serviceId,
        notificationURL: process.env.AUTHORIZE_PAYMENT_FEEDBACK_URL,
        amount: req.body.amount,
        productName: req.body.productName,
        transactionId: uuid(),
        msisdn: sanitized_msisdn,
      }
      const response = await MTNSDPAPIHandler.authorizePayment(data)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `Payment authorized successfully for ${data.msisdn}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Payment authorization request failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async chargeToken(req, res) {
    const auth = req.headers.authorization

    if (
      !req.headers.authorization
      || req.headers.authorization.indexOf('Basic ') === -1
    ) {
      return ResponseManager.sendErrorResponse({
        res,
        message: 'No Authentication header provided!',
      })
    }

    const requiredParams = ['oauth_token', 'msisdn']
    const missingFields = Utils.authenticateParams(req.body, requiredParams)

    if (missingFields.length != 0) {
      return ResponseManager.sendErrorResponse({
        res,
        message: `Please pass the following parameters for post request: ${missingFields}`,
      })
    }
    const authDetails = auth.split(' ')
    const rawAuth = Buffer.from(authDetails[1], 'base64').toString()
    const credentials = rawAuth.split(':')
    const username = credentials[0]
    const rawPassword = credentials[1]

    if (
      username == config.userAuth.username
      && rawPassword === config.userAuth.password
    ) {
      const sanitized_msisdn = Utils.msisdnSanitizer(req.body.msisdn, false)
      const data = {
        spId: config.mtn.spID,
        spPwd: config.mtn.spPwd,
        serviceId: req.body.serviceId,
        oauth_token: req.body.oauth_token,
        msisdn: sanitized_msisdn,
        amount: req.body.amount,
        referenceCode: uuid(),
      }
      const response = await MTNSDPAPIHandler.chargeToken(data)
      console.log('CHARGE response', response)
      if (!response.error) {
        return ResponseManager.sendResponse({
          res,
          message: `Charge successfull for ${data.msisdn}`,
        })
      }

      return ResponseManager.sendErrorResponse({
        res,
        message: `Charge failed failed with ${response.message}`,
      })
    }
    return ResponseManager.sendErrorResponse({
      res,
      message: 'Forbidden, bad authentication provided!',
    })
  },

  async handleMadapiDataSync(req, res) {
    return ResponseManager.sendResponse({
      res,
      message: 'Data received',
    })
  },

}
