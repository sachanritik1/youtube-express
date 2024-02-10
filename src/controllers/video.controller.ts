import asyncHandler from "../utils/asyncHandler"
import { Video } from "../models/video.model"
import { Comment } from "../models/comment.model"
import { ApiResponse } from "../utils/ApiResponse"
import { ApiError } from "../utils/ApiError"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary"
import mongoose from "mongoose"
import { Request, Response } from "express"
import { Files } from "../middlewares/multer.middleware"
import { User } from "../models/user.model"

export const getAllVideos = asyncHandler(
    async (req: Request, res: Response) => {
        const { page = 1, limit = 10, sortBy, sortType = 1 } = req.body
        try {
            const videos = await Video.find()
                .sort({ [sortBy]: sortType })
                .skip((page - 1) * limit)
                .limit(limit)

            return res.status(200).send(new ApiResponse(200, "success", videos))
        } catch (error) {
            console.log(error)
            throw new ApiError(500, "Error while Getting Videos")
        }
    }
)

export const publishAVideo = asyncHandler(
    async (req: Request, res: Response) => {
        const { title, description, duration } = req.body
        const userId = req.headers["userId"]
        if (!userId || typeof userId !== "string")
            throw new ApiError(401, "Unauthorized request")

        const files = req.files as Files

        const videoFileLocalPath = files?.videoFile?.[0]?.path
        const thumbnailLocalPath = files?.thumbnail?.[0]?.path

        if (!videoFileLocalPath || !thumbnailLocalPath)
            throw new ApiError(400, "Video File and Thumbnail are required")

        const videoFile = await uploadOnCloudinary(videoFileLocalPath)
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        try {
            const video = await Video.create({
                title: title,
                description: description,
                duration: duration,
                videoFile: videoFile,
                thumbnail: thumbnail,
                owner: new mongoose.Types.ObjectId(userId),
            })
            if (!video) throw new ApiError(500, "Error while Publishing")
            res.status(201).send(new ApiResponse(201, "success", {}))
        } catch (error) {
            console.log(error)
            throw new ApiError(500, "Error while Publishing Video")
        }
    }
)

export const getVideo = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params
        console.log(videoId)
        const response = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments",
                    pipeline: [
                        {
                            $match: {
                                isReply: false,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                email: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes",
                },
            },
            {
                $addFields: {
                    likes: { $size: "$likes" },
                    owner: { $arrayElemAt: ["$owner", 0] },
                },
            },
        ])
        res.status(200).send(new ApiResponse(200, "success", response[0]))
    } catch (error) {
        throw new ApiError(500, "Error while Getting Video")
    }
})

export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params
        const { title, description } = req.body

        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")

        if (title) video.title = title
        if (description) video.description = description
        if (req.file) {
            const thumbnail = await uploadOnCloudinary(req?.file?.path)
            if (video.thumbnail)
                await deleteFromCloudinary(video.thumbnail.publicId)
            video.thumbnail = thumbnail
        }

        await video.save({ validateBeforeSave: false })
        return res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Updating video details")
    }
})

export const togglePublishStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const { videoId } = req.params
        try {
            const video = await Video.findByIdAndUpdate(
                videoId,
                { isPublished: true },
                { new: true }
            )
            return res.status(200).send(new ApiResponse(200, "success", {}))
        } catch (error) {
            throw new ApiError(500, "Error while Toggling Publish Status")
        }
    }
)

export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndDelete(videoId)
        return res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Deleting Video")
    }
})
