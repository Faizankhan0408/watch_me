class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stackTrace=""
    ){
        super(message)
        this.statusCode=statusCode
        this.daata=null
        this.message=message
        this.success=false
        this.errors=errors

        if(stackTrace){
            this.stack=stackTrace
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}