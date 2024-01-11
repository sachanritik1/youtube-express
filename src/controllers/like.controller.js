import { Like } from "../models/like.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

export const toggleVideoLike = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params
        const { _id: userId } = req.user

        const video = Video.findById(videoId)
        if (!video) throw new ApiError("Video not found", 404)
        let like = await Like.findOne({ video: videoId, likedBy: userId })
        if (like) {
            await like.remove()
            return res
                .status(200)
                .send(new ApiResponse(200, "Video unliked", {}))
        }
        like = await Like.create({ video: videoId, likedBy: userId })
        return res
            .status(200)
            .send(new ApiResponse(200, "Video liked", 200, like))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const toggleCommentLike = asyncHandler(async (req, res, next) => {
    try {
        const { commentId } = req.params
        const { _id: userId } = req.user

        const comment = await Comment.findById(commentId)
        if (!comment) throw new ApiError("Comment not found", 404)
        let like = await Like.findOne({ comment: commentId, likedBy: userId })
        if (like) {
            await like.remove()
            return res
                .status(200)
                .send(new ApiResponse(200, "Comment unliked", {}))
        }
        like = await Like.create({ comment: commentId, likedBy: userId })
        return res
            .status(200)
            .send(new ApiResponse(200, "Comment liked", 200, like))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const toggleTweetLike = asyncHandler(async (req, res, next) => {
    try {
        const { tweetId } = req.params
        const { _id: userId } = req.user

        const tweet = await Tweet.findById(tweetId)
        if (!tweet) throw new ApiError("Tweet not found", 404)
        let like = await Like.findOne({ tweet: tweetId, likedBy: userId })
        if (like) {
            await like.remove()
            return res
                .status(200)
                .send(new ApiResponse(200, "Tweet unliked", {}))
        }
        like = await Like.create({ tweet: tweetId, likedBy: userId })
        return res
            .status(200)
            .send(new ApiResponse(200, "Tweet liked", 200, like))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const getLikedVideos = asyncHandler(async (req, res, next) => {
    try {
        const { _id: userId } = req.user
        const likes = await Like.find({ likedBy: userId }).sort({
            createdAt: -1,
        })
        return res
            .status(200)
            .send(new ApiResponse(200, "Liked videos", 200, likes))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})
