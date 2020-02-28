/**
 * An express Middleware that attaches two new functions for responding with error/success messages
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
    res.successResponse = (({
                                statusCode = 200, message = 'success', data, headers = {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Credentials': 'true',
                                    'Access-Control-Allow-Method': '*'
                                },
                            }) => {
        Object.entries(headers).forEach(([key, value]) => {
            res.set(key, value);
        });
        res.status(statusCode).send({
            data,
            status: true,
            message,
        });
    });

    res.errorResponse = (({
                              statusCode = 500, message = 'error', data, headers = {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': 'true',
                                'Access-Control-Allow-Method': '*'
                              },
                          }) => {
        Object.entries(headers).forEach(([key, value]) => {
            res.set(key, ':', value);
        });
        res.status(statusCode).send({
            data,
            status: false,
            message,
        });
    });

    next();
};
