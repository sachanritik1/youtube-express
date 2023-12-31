import "dotenv/config"
import connectDB from "./db/db.js"
import app from "./app.js"
const PORT = process.env.PORT || 5000

;(async () => {
    try {
        await connectDB()
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    } catch (err) {
        console.log("SERVER RUN FAILED " + err)
        process.exit(1)
    }
})()
