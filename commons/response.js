/**
 * An express Middleware that attaches two new functions for responding with error/success messages
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
    res.successResponse = (({ statusCode = 200, message = 'success', data }) => {
      res.status(statusCode).send({
        data,
        status: true,
        message,
      });
    });
  
    res.errorResponse = (({ statusCode = 500, message = 'error', data }) => {
      res.status(statusCode).send({
        data,
        status: true,
        message,
      });
    });
  
    next();
  };
  