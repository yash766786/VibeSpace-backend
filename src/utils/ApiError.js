// ApiError.js
class ApiError{
    constructor(statusCode, message = "Something went wrong", error="" ) {
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.error = error
    }
}

export { ApiError }