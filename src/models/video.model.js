import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { VIDEO_DB } from "../constants.js"
import { urlSchema } from "./url.model.js"

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: urlSchema,
            required: [true, "Video File is required"],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        thumbnail: {
            type: urlSchema,
        },
        duration: {
            type: Number,
            required: [true, "Duration is required"],
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Owner is required"],
            ref: "User",
            index: true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model(VIDEO_DB, videoSchema)
