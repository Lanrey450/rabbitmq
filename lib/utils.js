const R = require('ramda');



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