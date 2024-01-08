import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js"
import mongoose from "mongoose"

export const getAllVideos = asyncHandler(async (req, res) => {
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
})

export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    const userId = req.user.id

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    const videoFile = await uploadOnCloudinary(videoFileLocalPath, "videos")
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnails")

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
    try {
        const { videoId } = req.params
        const { title, description } = req.body

        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(404, "Video not found")

        if (title) video.title = title
        if (description) video.description = description
        if (req.file) {
            const thumbnail = await uploadOnCloudinary(
                req?.file?.path,
                "thumbnails"
            )
            await deleteFromCloudinary(video.thumbnail.public_id)
            video.thumbnail = thumbnail
        }

        await video.save({ validationBeforeSave: false })
        return res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Updating video details")
    }
})

export const togglePublishStatus = asyncHandler(async (req, res) => {
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
})

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndDelete(videoId)
        return res.status(200).send(new ApiResponse(200, "success", {}))
    } catch (error) {
        throw new ApiError(500, "Error while Deleting Video")
    }
})
