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
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        isReply: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", commentSchema)
