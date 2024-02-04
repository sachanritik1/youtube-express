import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import mainRouter from "./routes/mainRouter"

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_BASE_URL,
        credentials: true,
    })
)

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//use routes
app.use("/api/v1", mainRouter)

export default app
