import mongoose from "mongoose"

export const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, "Video URL is required"],
    },

    publicId: {
        type: String,
        required: [true, "Video Public ID is required"],
    },

    duration: {
        type: Number,
    },
})
