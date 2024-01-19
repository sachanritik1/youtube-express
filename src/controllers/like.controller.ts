import { Like } from "../models/like.model"
import { Tweet } from "../models/tweet.model"
import { Video } from "../models/video.model"
import { Comment } from "../models/comment.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import asyncHandler from "../utils/asyncHandler"
import { NextFunction, Request, Response } from "express"
import { MyRequest } from "../middlewares/auth.middleware"

export const toggleVideoLike = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            const { videoId } = req.params
            const { id: userId } = req.user

            const video = Video.findById(videoId)
            if (!video) throw new ApiError(404, "Video not found")
            let like = await Like.findOne({ video: videoId, likedBy: userId })
            if (like) {
                await like.deleteOne()
                return res
                    .status(200)
                    .send(new ApiResponse(200, "Video unlike", {}))
            }
            like = await Like.create({ video: videoId, likedBy: userId })
            return res
                .status(200)
                .send(new ApiResponse(200, "Video liked", like))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const toggleCommentLike = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            const { commentId } = req.params
            const { id: userId } = req.user

            const comment = await Comment.findById(commentId)
            if (!comment) throw new ApiError(404, "Comment not found")
            let like = await Like.findOne({
                comment: commentId,
                likedBy: userId,
            })
            if (like) {
                await like.deleteOne()
                return res
                    .status(200)
                    .send(new ApiResponse(200, "Comment unlike", {}))
            }
            like = await Like.create({ comment: commentId, likedBy: userId })
            return res
                .status(200)
                .send(new ApiResponse(200, "Comment liked", like))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const toggleTweetLike = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            const { tweetId } = req.params
            const { id: userId } = req.user

            const tweet = await Tweet.findById(tweetId)
            if (!tweet) throw new ApiError(404, "Tweet not found")
            let like = await Like.findOne({ tweet: tweetId, likedBy: userId })
            if (like) {
                await like.deleteOne()
                return res
                    .status(200)
                    .send(new ApiResponse(200, "Tweet unlike", {}))
            }
            like = await Like.create({ tweet: tweetId, likedBy: userId })
            return res
                .status(200)
                .send(new ApiResponse(200, "Tweet liked", like))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const getLikedVideos = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            const { id: userId } = req.user
            const likes = await Like.find({ likedBy: userId }).sort({
                createdAt: -1,
            })
            return res
                .status(200)
                .send(new ApiResponse(200, "Liked videos", likes))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)
