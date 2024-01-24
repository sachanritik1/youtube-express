export type ApiErrorOptions = {
    statusCode: number
    message: string
    errors?: Array<any>
    stack?: any
}

export class ApiError extends Error {
    public statusCode: number
    public message: string
    public errors: any
    public stack: any
    public data: any
    public success: boolean

    constructor(
        statusCode: number,
        message: string,
        errors?: any,
        stack?: any
    ) {
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.data = null
        this.message = message
        this.success = false
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
