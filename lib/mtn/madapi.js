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


// const axios = require('axios').default


module.exports = {
	async sendSmsMT(data, token) {
        const url = `${config.mtn_base_url}/v2/messages/sms/outbound`;

        token = 'KoSE5RPSOJvRcMwQWcNmqHzTUQ4h';
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

    await redis.del('temporaryMtnToken');

		let temporaryMtnToken = JSON.parse(await redis.getAsync('temporaryMtnToken'));

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
			  redis.set('temporaryMtnToken', JSON.stringify(mtnResponse.data), 'ex', 8 * 60)
			  temporaryMtnToken = mtnResponse.data
		} 
		const { access_token } = temporaryMtnToken
		return access_token;
	},

    async registerShortcode(params, token) {
        const { shortCode, data } = params;
        const url = `${config.mtn_base_url}/messages/sms/outbound/${shortCode}/subscription`;

        data.clientCorrelator = uuid().split('-')[4];
      
        const result = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // save subscriptionId to DB
      
        return result.data.data;
	},

    async unRegisterShortcode(data, token) {
        const { shortCode, subscriptionId} = data;
        const url = `${config.mtn_base_url}/messages/sms/outbound/${shortCode}/subscription/${subscriptionId}`;

        data.clientCorrelator = uuid().split('-')[4];
        
        const result = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
        return result.data.data;
	},
}
