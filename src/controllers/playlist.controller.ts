import { Playlist } from "../models/playlist.model"
import asyncHandler from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { NextFunction, Request, Response } from "express"
import { MyRequest } from "../middlewares/auth.middleware"

export const createPlaylist = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
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
                .send(new ApiResponse(201, "Playlist created", playlist))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const getPlaylist = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params
            const playlist = await Playlist.findById(playlistId)
            return res
                .status(200)
                .send(new ApiResponse(200, "Playlist found", playlist))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const deletePlaylist = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params
            const playlist = await Playlist.findOneAndDelete({
                id: playlistId,
                owner: req.user.id,
            })
            return res
                .status(200)
                .send(new ApiResponse(200, "Playlist deleted", {}))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const updatePlaylist = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
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
                .send(new ApiResponse(200, "Playlist updated", playlist))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)

export const addVideoToPlaylist = asyncHandler(
    async (req: MyRequest, res: Response, next: NextFunction) => {
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
                .send(new ApiResponse(200, "Video added to playlist", playlist))
        } catch (err) {
            throw new ApiError(500, "Something went wrong")
        }
    }
)
