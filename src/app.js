import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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

//import routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"

//use routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)

export default app
