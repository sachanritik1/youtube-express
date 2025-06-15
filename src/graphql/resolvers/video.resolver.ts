import mongoose from "mongoose"
import { Files } from "../../middlewares/multer.middleware"
import { Video } from "../../models/video.model"
import { ApiError } from "../../utils/ApiError"
import { uploadOnCloudinary } from "../../utils/cloudinary"
import {
    GraphQLResolverContext,
    ResolverArgs,
    ResolverParent,
    VideoFilterQuery,
} from "../types"

export const videoResolvers = {
    Query: {
        getVideo: async (
            _: ResolverParent,
            { videoId }: { videoId: string }
        ) => {
            try {
                const video = await Video.findById(videoId).populate("owner")

                if (!video) {
                    throw new ApiError(404, "Video not found")
                }

                return video
            } catch (error) {
                throw error
            }
        },

        getAllVideos: async (
            _: ResolverParent,
            {
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortType = "desc",
                userId,
                search,
            }: {
                page?: number
                limit?: number
                sortBy?: string
                sortType?: string
                userId?: string
                search?: string
            }
        ) => {
            try {
                // Build match stage for filtering
                const matchStage: any = {}

                // Add userId filter if provided
                if (userId) {
                    matchStage.owner = new mongoose.Types.ObjectId(userId)
                }

                // Add search filter for title if provided
                if (search && search.trim()) {
                    matchStage.title = {
                        $regex: search.trim(),
                        $options: "i", // case insensitive
                    }
                }

                // Build sort stage
                const sortStage: any = {}
                sortStage[sortBy] = sortType === "asc" ? 1 : -1

                // Build aggregation pipeline
                const pipeline = [
                    {
                        $match: matchStage,
                    },
                    {
                        $lookup: {
                            from: "users", // Make sure this matches your User collection name
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        },
                    },
                    {
                        $unwind: "$owner",
                    },
                    {
                        $project: {
                            owner: {
                                password: 0,
                                refreshToken: 0,
                                accessToken: 0,
                            },
                        },
                    },
                    {
                        $sort: sortStage,
                    },
                ]

                const options = {
                    page: parseInt(page.toString()),
                    limit: parseInt(limit.toString()),
                    customLabels: {
                        totalDocs: "totalVideos",
                        docs: "videos",
                        totalPages: "totalPages",
                        page: "currentPage",
                    },
                }

                const aggregate = Video.aggregate(pipeline)
                const result = await Video.aggregatePaginate(aggregate, options)

                return {
                    videos: result.videos,
                    totalPages: result.totalPages,
                    totalVideos: result.totalVideos,
                    currentPage: result.currentPage,
                }
            } catch (error) {
                throw error
            }
        },
    },

    Mutation: {
        // Basic implementations - these would need to be expanded with actual file upload handling
        publishVideo: async (
            _: ResolverParent,
            {
                title,
                description,
                duration,
                videoFile,
                thumbnail,
            }: {
                title: string
                description: string
                duration: number
                videoFile: File
                thumbnail: File
            },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const files = req.files as Files
                const videoFileLocalPath = files?.videoFile?.[0]?.path
                const thumbnailLocalPath = files?.thumbnail?.[0]?.path

                if (!videoFileLocalPath || !thumbnailLocalPath)
                    throw new ApiError(
                        400,
                        "Video File and Thumbnail are required"
                    )

                const videoFile = await uploadOnCloudinary(videoFileLocalPath)
                const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

                const video = await Video.create({
                    title,
                    description,
                    owner: userId,
                    isPublished: true,
                    videoFile,
                    thumbnail,
                    duration,
                })

                return video
            } catch (error) {
                throw error
            }
        },

        updateVideo: async (
            _: ResolverParent,
            {
                videoId,
                title,
                description,
                thumbnail,
            }: {
                videoId: string
                title?: string
                description?: string
                thumbnail?: string
            },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const video = await Video.findById(videoId)
                if (!video) {
                    throw new ApiError(404, "Video not found")
                }

                if (video.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You don't have permission to update this video"
                    )
                }

                const updateFields: any = {}
                if (title) updateFields.title = title
                if (description) updateFields.description = description

                // In a real implementation, thumbnail would be handled via file upload
                if (thumbnail) {
                    updateFields.thumbnail = {
                        url: thumbnail,
                        public_id: "placeholder-updated",
                    }
                }

                const updatedVideo = await Video.findByIdAndUpdate(
                    videoId,
                    { $set: updateFields },
                    { new: true }
                ).populate("owner")

                return updatedVideo
            } catch (error) {
                throw error
            }
        },

        deleteVideo: async (
            _: ResolverParent,
            { videoId }: { videoId: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const video = await Video.findById(videoId)
                if (!video) {
                    throw new ApiError(404, "Video not found")
                }

                if (video.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You don't have permission to delete this video"
                    )
                }

                // In a real implementation, you would also delete files from cloud storage
                await Video.findByIdAndDelete(videoId)

                return true
            } catch (error) {
                throw error
            }
        },

        togglePublishStatus: async (
            _: ResolverParent,
            { videoId }: { videoId: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const video = await Video.findById(videoId)
                if (!video) {
                    throw new ApiError(404, "Video not found")
                }

                if (video.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You don't have permission to update this video"
                    )
                }

                const updatedVideo = await Video.findByIdAndUpdate(
                    videoId,
                    { $set: { isPublished: !video.isPublished } },
                    { new: true }
                ).populate("owner")

                return updatedVideo
            } catch (error) {
                throw error
            }
        },
    },
}
