import mongoose from "mongoose"
import { PLAYLIST_DB } from "../constants/db"

const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        description: {
            type: String,
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

export const Playlist = mongoose.model(PLAYLIST_DB, playlistSchema)
