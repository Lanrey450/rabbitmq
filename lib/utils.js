const R = require('ramda');
const X2JS = require('x2js');
const mongoDBModelAirtel = require('../models/airtel/subscription');
const config = require('../config');

const mongoDBClient = require('../mongoClient');

const publish = require('../rabbitmq/producer');

const Axios = require('axios');


module.exports = {

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
    
      if (!R.prop('tag', service) || R.isEmpty(service.tag)) {
        errors.push('Tag was not profiled for this service');
      }
    
      const isError = errors.length > 0;
      return {
        error: isError,
        errors,
      }
      
    }

  }