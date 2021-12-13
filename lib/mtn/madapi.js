/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase

const axios = require('axios');
const uuid = require('uuid4');


module.exports = {
	async sendSmsMT(data) {
        const url = 'https://preprod.api.mtn.com/v2/messages/sms/outbound';

        const token = `sBxymulTtsW88VPDf1U1BYbG1nIK`;

        data.clientCorrelator = uuid().split('-')[4];
      
        const result = await axios.post(url, body, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
        console.log((result.data.data));
      
        return result;
	},
}
