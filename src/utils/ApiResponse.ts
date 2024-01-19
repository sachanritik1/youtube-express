export class ApiResponse {
    public message: string
    public data: any
    public success: boolean

    constructor(statusCode:number, message:string, data:any) {
        this.message = message
        this.data = data
        this.success = statusCode < 400
    }
}
