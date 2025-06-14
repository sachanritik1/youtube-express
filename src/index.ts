import "dotenv/config"
import connectDB from "./db/db"
const PORT: string = process.env.PORT || "5000"
import http from "http"
import WebSocket from "ws"
import { app } from "./app"
import { liveChatController } from "./liveChat/controller"
import { setupApolloServer } from "./graphql"

const server = http.createServer(app)

;(async () => {
    try {
        await connectDB()

        // Setup GraphQL server
        await setupApolloServer(app)

        server.listen(PORT, () => {
            console.log(
                `🚀 GraphQL API running on http://localhost:${PORT}/graphql`
            )
        })
    } catch (err) {
        console.log("SERVER RUN FAILED " + err)
        process.exit(1)
    }
})()

const wss = new WebSocket.Server({ server })

wss.on("connection", liveChatController)

export { server, app, wss }
