import "dotenv/config"
import connectDB from "./db/db"
import { app } from "./app"
import http from "http"
const PORT: string = process.env.PORT || "5000"

const server = http.createServer(app)

;(async () => {
    try {
        await connectDB()
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    } catch (err) {
        console.log("SERVER RUN FAILED " + err)
        process.exit(1)
    }
})()

export { server }
