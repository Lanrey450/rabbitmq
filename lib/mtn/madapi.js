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
		// const url = `https://preprod.api.mtn.com/v2/messages/sms/outbound`;
		const url = `${config.mtn_prod_base_url}/v2/messages/sms/outbound`;
		const transactionId = generateId();

		// token = 'KoSE5RPSOJvRcMwQWcNmqHzTUQ4h';
		data.clientCorrelator = uuid().split('-')[4];

		const result = await axios.post(url, data, {
			headers: {
				Authorization: `Bearer ${token}`,
				transactionId,
			},
		});

		// console.log(result.data.data);

		return result.data.data;
	},

	async generateToken() {
		// const url = `https://preprod.api.mtn.com/v1/oauth/access_token/accesstoken?grant_type=client_credentials`
		const url = `${config.mtn_prod_base_url}/v1/oauth/access_token/accesstoken?grant_type=client_credentials`
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
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					responseType: 'json',
				})
				.catch((error) => ({ error }))

			console.log("mtnResponse: ", mtnResponse);
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
		// const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions?nodeId=${config.mtn_nodeId}&subscriptionProviderId=CSM`
		const url = `${config.mtn_sub_prod_base_url}/v2/customers/${customerId}/subscriptions?nodeId=${config.mtn_nodeId}&subscriptionProviderId=CSM`
		console.log("url: ", url)
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

		console.log("profile query result: ", result.data);

		return result.data;
	},
	
	async subscribe(token, params) {
		const { customerId, body } = params;
		console.log("params: ", params);
		// const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions`
		const url = `${config.mtn_sub_prod_base_url}/v2/customers/${customerId}/subscriptions`
		console.log("url: ", url)
		const transactionId = generateId();
		
		const result = await axios.post(url, body, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		});
		
		console.log("subscription result: ", result.data);

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

		// const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions/history?nodeId=${config.mtn_nodeId}&subscriptionProviderId=CSM`;
		const url = `${config.mtn_sub_prod_base_url}/v2/customers/${customerId}/subscriptions/history?nodeId=${config.mtn_nodeId}&subscriptionProviderId=CSM`;
		console.log("subscribe_history: ", url);

		const result = await axios.get(url, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		}).catch((error) => ({ error }))
		if (result.error) {
			return { error: result.error }
		}

		console.log("subscription_history result: ", result.data);

		return result.data;
	},

	async deleteSubscription(token, params) {

		const { customerId, subscriptionId, description } = params;
		const transactionId = generateId();

		// const url = `${config.mtn_base_url}/v2/customers/${customerId}/subscriptions/${subscriptionId}?subscriptionProviderId=CSM&description=${description}`;
		const url = `${config.mtn_sub_prod_base_url}/v2/customers/${customerId}/subscriptions/${subscriptionId}?subscriptionProviderId=CSM&description=${description}`;
		console.log("mtn-madapi-unsubscribe: ", url);

		const result = await axios.delete(url, {
			headers: {
				"x-API-Key": token,
				transactionId,
			},
		})

		console.log("unsubscription result: ", result.data);
		// .catch((error) => ({ error }))
		
		// if (result.error) {
		// 	return { error: result.error }
		// }


		return result.data;
	},
}

function generateId() {
	return new Date().valueOf();
}