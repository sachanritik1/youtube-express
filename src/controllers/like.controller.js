import { Like } from "../models/like.model"
import { Tweet } from "../models/tweet.model"
import { Video } from "../models/video.model"
import { ApiError } from "../utils/ApiError"
import asyncHandler from "../utils/asyncHandler"

export const likeVideo = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params
        const { _id: userId } = req.user

        const video = Video.findById(videoId)
        if (!video) throw new ApiError("Video not found", 404)
        await Like.create({ video: videoId, likedBy: userId })

        return res.status(200).send(new ApiError("Video liked", 200))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const unlikeVideo = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params
        const { _id: userId } = req.user

        const video = Video.findById(videoId)
        if (!video) throw new ApiError("Video not found", 404)
        await Like.findOneAndDelete({ video: videoId, likedBy: userId })

        return res.status(200).send(new ApiError("Video unliked", 200))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const likeTweet = asyncHandler(async (req, res, next) => {
    try {
        const { tweetId } = req.params
        const { _id: userId } = req.user

        const tweet = await Tweet.findById(tweetId)
        if (!tweet) throw new ApiError("Tweet not found", 404)
        await Like.create({ tweet: tweetId, likedBy: userId })

        return res.status(200).send(new ApiError("Tweet liked", 200))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const unlikeTweet = asyncHandler(async (req, res, next) => {
    try {
        const { tweetId } = req.params
        const { _id: userId } = req.user

        const tweet = await Tweet.findById(tweetId)
        if (!tweet) throw new ApiError("Tweet not found", 404)
        await Like.findOneAndDelete({ tweet: tweetId, likedBy: userId })

        return res.status(200).send(new ApiError("Tweet unliked", 200))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})
