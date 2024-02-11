import "dotenv/config"
import connectDB from "./db/db"
const PORT: string = process.env.PORT || "5000"
import http from "http"
import WebSocket from "ws"
import { app } from "./app"
import { liveChatController } from "./liveChat/controller"

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

const wss = new WebSocket.Server({ server })

wss.on("connection", liveChatController)

export { server, app, wss }
