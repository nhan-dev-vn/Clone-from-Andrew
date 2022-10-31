const customErrorFormatter = (message, statusCode) => {
    const err = Error(message);
    err.status = statusCode;
    err.title = message;
    return err

}

// The other option is you can call the above commented function inside the next()

module.exports = customErrorFormatter
