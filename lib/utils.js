const R = require('ramda');
const X2JS = require('x2js');
const mongoDBModelAirtel = require('../models/airtel/subscription');
const config = require('../config');

const mongoDBClient = require('../mongoClient');

const publish = require('../rabbitmq/producer');

const Axios = require('axios');


module.export = {

    /**
     * Used to normalize the passed in MSISDN
     *
     * @param {String} phoneNumber MSISDN
     * @param {Boolean} plus Boolean deciding whether to include + as the MSISDN prefix
     * @returns {String} msisdn
     */


    msisdnSanitizer(phoneNumber, plus) {
            let msisdn = phoneNumber;
            if (msisdn) {
              if (msisdn.length === 14) {
                msisdn = `234${msisdn.substr(4)}`;
              }
        
              msisdn = msisdn.replace(/\s+/g, '');
              msisdn = msisdn.replace('+', '');
        
              if (!Number.isNaN(msisdn)) {
                if (msisdn.match(/^234/i)) {
                  msisdn = `0${msisdn.substr(3)}`;
                }
        
                if (msisdn.length === 11) {
                  msisdn = `+234${msisdn.substr(1)}`;
        
                  if (!plus) {
                    msisdn = msisdn.replace('+', '');
                  }
        
                  return msisdn;
                }
        
                return '';
              }
        
              return '';
            }
        
            return '';
          },

/**
 * Used to validate that a service object contain all the necessary
 * properties that are needed to make a call to the Airtel's IBM Subscription Engine.
 *
 * @param service
 * @returns {{error: boolean, errors: Array}}
 */
 validateServiceInfo(service){
    const errors = [];
  
    if (!R.prop('product', service) || R.isEmpty(service.product)) {
      errors.push('product was not profiled with this service');
    }
  
    if (!R.prop('shortCode', service) || R.isEmpty(service.shortCode)) {
      errors.push('shortCode was not profiled with this service');
    }
  
    if (!R.prop('name', service) || R.isEmpty(service.name)) {
      errors.push('name was not profiled with this service');
    }
  
    if (!R.prop('cpID', service) || R.isEmpty(service.cpID)) {
      errors.push('cpID was not profiled with this service');
    }
  
    if (!R.prop('cpPassword', service) || R.isEmpty(service.cpPassword)) {
      errors.push('cpPassword was not profiled with this service');
    }
  
    if (!R.prop('productIds', service) || R.isEmpty(service.productIds)) {
      errors.push('productIds was not profiled for this service');
    }
  
    const isError = errors.length > 0;
    return {
      error: isError,
      errors,
    }

        
  },
  /**
   * Used to convert XML data to JSON
   *
   * @param {String} xmlData
   * @returns {Object} JSON formatted data
   */
   xmltoJSON (xmlData) {
    const x2js = new X2JS();
    return x2js.xml2js(this.xmlSanitizer(xmlData));
  }, 

  /**
   * Cleans up XML by removing CDATA and false strings
   * @param {String} xmlData
   * @returns {String} cleaned up XML
   */
   xmlSanitizer(xmlData) {
    return xmlData.toString('utf8')
      .replace(/(&lt;)/g, '<')
      .replace(/(&gt;)/g, '>')
      .replace('<![CDATA[', '')
      .replace(']]>', '');
  },

  /**
     * Return service details from campaign ID
     * Get service details from Redis store
     * @param {String} serviceKey Campaign ID / Keyword / Product ID for service
     */

  fetchServiceDetails(serviceKey){



  },

  /**
     * Fetches a single record from the connected MongoDB instance.
     *
     * @param params
     * @returns {Promise}
     */
    get(params) {
      return new Promise((resolve, reject) => {
        const query = mongoDBModelAirtel.findOne(params.conditions);
  
        if (params.fields) { query.select(params.fields); }
  
        return query.exec((err, modelData) => {
          if (err) {
            return reject(this.handleError(err));
          }
          return resolve(modelData);
        });
      });
    },
  
  
    /**
       * Fetches a single record from the connected MongoDB instance.
       * This uses the find().limit() instead of the findOne().
       * There is significant increase in performance...
       * A magnitude in the order of 2.
       * Ref: https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
       *
       * @param params
       * @returns {Promise}
       */
    getOneOptimised(params) {
      return new Promise((resolve, reject) => {
        const query = mongoDBModelAirtel.find(params.conditions).limit(1);
  
        if (params.fields) { query.select(params.fields); }
  
        return query.exec((err, modelData) => {
          if (err) {
            return reject(this.handleError(err));
          }
          return resolve(modelData);
        });
      });
    },
  
  
    /**
       * Fetches bulk records from the connected MongoDB instance.
       *
       * @param params
       * @returns {Promise}
       */
    getBulk(parameters) {
      const params = parameters;
      return new Promise((resolve, reject) => {
        if (!params.limit) {
          params.limit = config.databases.query_limit;
        }
  
        const query = mongoDBModelAirtel.find(params.conditions);
  
        if (params.fields) {
          query.select(params.fields);
        }
  
  
        if (params.distinct) {
          query.distinct(params.distinct);
        } else {
          query.limit(params.limit);
        }
  
        if (params.sort) {
          query.sort(params.sort);
        }
  
  
        return query.exec((error, modelData) => {
          if (error) {
            return reject(this.handleError(error));
          }
          return resolve(modelData);
        });
      });
    },
  
  
    /**
       * Aggregates data within MongoDB by certain conditional criteria and returns same.
       * Typically used in report generation or logs...
       * But advisable to do logging/report aggregation on a stacked DB that is highly
       * optimised for search,.. E.g Elastic Search or GraphDB
       *
       * @param params
       * @returns {Promise}
       */
    aggregriate(params) {
      return new Promise((resolve, reject) => {
        const query = mongoDBModelAirtel.aggregate(params.conditions);
  
        return query.exec((err, modelData) => {
          if (err) {
            return reject(this.handleError(err));
          }
          return resolve(modelData);
        });
      });
    },
  
  
    /**
       * Saves data into the MongoDB instance
       *
       * @param data
       * @returns {Promise}
       */
    save(data) {
      return new Promise((resolve, reject) => {
        const mongodbSaveSchema = mongoDBModelAirtel(data);
  
        return mongodbSaveSchema.save((error, savedData) => {
          if (error != null) {
            return reject(this.handleError(error));
          }
          return resolve(savedData);
        });
      });
    },
  
  
    /**
       * Updates a SINGLE RECORD in the MongoDB instance's DB based on some conditional criteria
       *
       * @param params - the conditional parameters
       * @param data - the data to update
       * @returns {Promise}
       */
    update(params, data) {
      return new Promise((resolve, reject) => mongoDBModelAirtel.findOneAndUpdate(
        params.conditions,
        { $set: data },
        { new: true },
        (error, response) => {
          if (error) {
            return reject(this.handleError(error));
          }
          return resolve(response);
        }
      ));
    },
  
  
    /**
       * Updates MULTIPLE RECORDS within the MongoDB instance's DB based on some conditional criteria
       *
       * @param params - the conditional parameters
       * @param data - the data to update
       * @returns {Promise}
       */
    updateBulk(params, data) {
      return new Promise((resolve, reject) => mongoDBModelAirtel.update(
        params.conditions,
  
        { $set: data },
  
        { new: true, multi: true }, (error, response) => { // {multi: true},
          if (error) {
            return reject(this.handleError(error));
          }
          return resolve(response);
        }
      ));
    },
  
  
    /**
       * This closes the connection from this client to the running MongoDB database
       *
       * @returns {Promise}
       */
    close() {
      return new Promise((resolve, reject) => {
        mongoDBClient.close();
  
        return resolve({
          error: false,
          msg: 'connection was successfully closed.',
        });
      });
    },
  
  
    /**
       * Used to format the error messages returned from the MongoDB server during CRUD operations
       *
       * @param report
       * @returns {{error: boolean, message: *}}
       */
    static handleError(report) {
      return { error: true, msg: report };
    },


    /**
   * Sanitizes the keyword to get  rid of spaces
   *
   * @param {String} keywordParam
   * @returns {String} Keyword trimmed of all spaces and formatted for saving
   */
  keywordSanitizer(keywordParam) {
    return keywordParam.trim()
      .replace(/ +/g, '_')
      .toUpperCase();
  },
    




    } 