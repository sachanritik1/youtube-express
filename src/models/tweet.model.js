const tweetSchema = new mongoose.Schema(
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
    },
    { timestamps: true }
)
