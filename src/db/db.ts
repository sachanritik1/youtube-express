import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const dbInstance = await mongoose.connect(process.env.MONGO_URI || "")
        console.log(`MongoDB connected to host: ${dbInstance.connection.host}`)
    } catch (err) {
        console.log("MONGODB CONNECTION FAILED " + err)
        process.exit(1)
    }
}
export default connectDB
