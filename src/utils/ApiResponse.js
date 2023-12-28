class ApiResponse {
   constructor(message = "Success", data, statusCode) {
      this.message = message
      this.data = data
      this.success = statusCode < 400
   }
}
