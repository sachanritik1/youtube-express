const likeSchema = new mongoose.Schema(
    {
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User is required"],
            ref: "User",
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tweet",
        },
    },
    {
        timestamps: true,
    }
)

export const Like = mongoose.model("Like", likeSchema)
