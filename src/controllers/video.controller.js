import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

export const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.body

    try {
        const videos = await Video.find({ owner: userId })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortBy]: sortType })

        res.status(200).send(new ApiResponse(200, "success", videos))
    } catch (error) {
        throw new ApiError(500, "Error while Getting Videos")
    }
})

export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    const userId = req.user.id

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    const videoUrl = await uploadOnCloudinary(videoFileLocalPath, "videos")

    const thumbnailUrl = await uploadOnCloudinary(
        thumbnailLocalPath,
        "thumbnails"
    )

    try {
        const video = await Video.create({
            title: title,
            description: description,
            duration: duration,
            videoFile: videoUrl,
            thumbnail: thumbnailUrl,
            owner: new mongoose.Types.ObjectId(userId),
        })
        if (!video) throw new ApiError(500, "Error while Publishing")
        res.status(201).send(new ApiResponse(201, "success", {}))
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Error while Publishing Video")
    }
})

export const getVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")
        res.status(200).send(new ApiResponse(200, "success", video))
    } catch (error) {
        throw new ApiError(500, "Error while Getting Video")
    }
})

export const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { thumbnail } = req.file
    const { title, description } = req.body

    const options = {}

    if (title) options.title = title
    if (description) options.description = description
    if (thumbnail) options.thumbnail = thumbnail

    try {
        const video = await Video.findByIdAndUpdate(videoId, options, {
            new: true,
        })
        if (!video) throw new ApiError(404, "Video not found")
        res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Updating Thumbnail")
    }
})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")
        video.isPublished = !video.isPublished
        await video.save()
        res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Toggling Publish Status")
    }
})

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndDelete(videoId)
        if (!video) throw new ApiError(404, "Video not found")
        res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Deleting Video")
    }
})
