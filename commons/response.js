class ResponseManager {
    constructor(){
        // you  can attach logger,database clients here
    }

    sendResponse({res, statusCode = 200, message = "success", responseBody}){
        res.status(statusCode).send({
            data: responseBody,
            status: true,
            message
        });
    }

    sendErrorResponse({res, statusCode=500, message = "error", responseBody}){
        res.status(statusCode).send({
            data: responseBody,
            status: false,
            message
        })
    }
}

module.exports = ResponseManager;