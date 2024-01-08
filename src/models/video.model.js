import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { VIDEO_DB } from "../constants"

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: [true, "Video is required"],
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
            type: String,
            required: [true, "Thumbnail is required"],
        },
        duration: {
            type: Number,
            required: [true, "Duration is required"],
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Owner is required"],
            ref: "User",
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
