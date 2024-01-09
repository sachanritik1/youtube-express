import { Playlist } from "../models/playlist.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const createPlaylist = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, isPublic } = req.body
        const playlist = await Playlist.create({
            name,
            description,
            isPublic,
            owner: req.user.id,
        })
        return res
            .status(201)
            .send(new ApiResponse("Playlist created", 201, playlist))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const getPlaylist = asyncHandler(async (req, res, next) => {
    try {
        const { playlistId } = req.params
        const playlist = await Playlist.findById(playlistId)
        return res
            .status(200)
            .send(new ApiResponse("Playlist found", 200, playlist))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const deletePlaylist = asyncHandler(async (req, res, next) => {
    try {
        const { playlistId } = req.params
        const playlist = await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: req.user.id,
        })
        return res
            .status(200)
            .send(new ApiResponse("Playlist deleted", 200, {}))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const updatePlaylist = asyncHandler(async (req, res, next) => {
    try {
        const { playlistId } = req.params
        const { name, description, isPublic } = req.body
        const playlist = await Playlist.findOneAndUpdate(
            { id: playlistId, owner: req.user.id },
            { name, description, isPublic },
            { new: true }
        )
        return res
            .status(200)
            .send(new ApiResponse("Playlist updated", 200, playlist))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})

export const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    try {
        const { playlistId } = req.params
        const { videoId } = req.body
        const playlist = await Playlist.findOneAndUpdate(
            { id: playlistId, owner: req.user.id },
            { $push: { videos: videoId } },
            { new: true }
        )
        return res
            .status(200)
            .send(new ApiResponse("Video added to playlist", 200, playlist))
    } catch (err) {
        throw new ApiError("Something went wrong", 500)
    }
})
