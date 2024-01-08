export class ApiResponse {
    constructor(statusCode, message = "Success", data) {
        this.message = message
        this.data = data
        this.success = statusCode < 400
    }
}
