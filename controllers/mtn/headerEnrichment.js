/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-tabs */
// eslint-disable-next-line camelcase


// const MTNMADAPIAPIHandler = require('../../lib/mtn/madapi');
const ResponseManager = require('../../commons/response');

const config = require('../../config')


module.exports = {

	async headerEnrichment(req, res) {

        try {
            const result = req.headers
    
            return ResponseManager.sendResponse({
                res,
                message: 'Request Headers',
                responseBody: result,
            });
        } catch (error){
            console.log('Error requesting headers', error)
            return ResponseManager.sendErrorResponse({
                res,
                message: `Error requesting headers`,
            })
        }

	},
  
}
