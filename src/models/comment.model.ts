import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Text is required"],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Owner is required"],
            ref: "User",
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Video is required"],
            ref: "Video",
            index: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            index: true,
            default: null,
        },
    },
    { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", commentSchema)
