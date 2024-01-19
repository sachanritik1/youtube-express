import mongoose from "mongoose"

export interface IUrl {
    url: string
    publicId: string
    duration?: number
}

export const urlSchema = new mongoose.Schema<IUrl>({
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
