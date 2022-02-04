/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const axios = require('axios');
const uuid = require('uuid4');
const redis = require('../../redis');
const config = require('../../config')



module.exports = {
	async sendSmsMT(data, token) {
		const url = `${config.mtn_base_url}/v2/messages/sms/outbound`;

		// token = 'KoSE5RPSOJvRcMwQWcNmqHzTUQ4h';
		data.clientCorrelator = uuid().split('-')[4];

		const result = await axios.post(url, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// console.log(result.data.data);

		return result.data.data;
	},

	async generateToken() {
		const url = `${config.mtn_base_url}/v1/oauth/access_token/accesstoken?grant_type=client_credentials`
		const params = new URLSearchParams()
		params.append('client_id', config.mtn_client_id)
		params.append('client_secret', config.mtn_client_secret);


		// let temporaryMtnToken = JSON.parse(await redis.getAsync('temporaryMtnToken'));

		let temporaryMtnToken = await redis.getAsync('temporaryMtnToken');

		console.log('token from redis', temporaryMtnToken);

		//  if access token has expired => GET NEW TOKEN FROM MTN
		if (!temporaryMtnToken) {
			const mtnResponse = await axios
				.post(url, params, {
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					responseType: 'json',
				})
				.catch((error) => ({ error }))

			if (mtnResponse.error) {
				throw new Error('Error occurred while trying to get token from mtn')
			}
			temporaryMtnToken = mtnResponse.data.access_token
			redis.set('temporaryMtnToken', temporaryMtnToken, 'ex', 8 * 60)
		}
		// const { access_token } = temporaryMtnToken
		return temporaryMtnToken;
	},

	async registerShortcode(params, token) {
		const { shortCode, data } = params;
		const url = `${config.mtn_base_url}/v2/messages/sms/outbound/${shortCode}/subscription`;

		const result = await axios.post(url, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// save subscriptionId to DB

		return result.data.data;
	},

	async unRegisterShortcode(data, token) {
		const { shortCode, subscriptionId } = data;
		const url = `${config.mtn_base_url}/v2/messages/sms/outbound/${shortCode}/subscription/${subscriptionId}`;

		const result = await axios.delete(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return result.data.data;
	},

	async deliveryStatus(token, shortCode, requestId) {
		const url = `${config.mtn_base_url}/v2/messages/sms/outbound/${shortCode}/${requestId}/deliveryStatus`

		const result = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).catch((error) => ({ error }))
		if (result.error) {
			return { error: result.error }
		}

		return result.data.data.deliveryStatus;
	},

	async getSubscriptions(token, customerId) {
		const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions?nodeId=Iyke Jordan&subscriptionProviderId=CSM`
		const transactionId = generateId();

		const result = await axios.get(url, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		}).catch((error) => ({ error }))
		if (result.error) {
			return { error: result.error }
		}

		return result.data;
	},
	
	async subscribe(token, params) {
		const { customerId, body } = params;
		console.log("params: ", params);
		const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions`
		console.log("url: ", url)
		const transactionId = generateId();
		
		const result = await axios.post(url, body, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		});
		
		console.log("result: ", result);

		return result.data;
	},

	async deleteSubscriptions(token, params) {
		const { customerId } = params;
		const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions`

		const result = await axios.delete(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});


		return result.data;
	},

	async getSubscriptionHistory(token, params) {

		const { customerId, subscriptionId } = params;
		const transactionId = generateId();

		const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions/history?nodeId=Iyke Jordan&subscriptionProviderId=CSM`;

		const result = await axios.get(url, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		}).catch((error) => ({ error }))
		if (result.error) {
			return { error: result.error }
		}

		return result.data;
	},

	async deleteSubscription(token, params) {

		const { customerId, subscriptionId } = params;
		const transactionId = generateId();

		const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions/1356?subscriptionProviderId=CSM&nodeId=Comviva&description=P_Comvi_TestN_1003`

		const result = await axios.delete(url, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		}).catch((error) => ({ error }))
		if (result.error) {
			return { error: result.error }
		}

		return result.data;
	},
}

function generateId() {
	return new Date().valueOf();
}