import { Video } from "../../models/video.model"
import { ApiError } from "../../utils/ApiError"
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
            }: {
                page?: number
                limit?: number
                sortBy?: string
                sortType?: string
                userId?: string
            }
        ) => {
            try {
                // Type assertion for pagination
                const options: any = {
                    page: parseInt(page.toString()),
                    limit: parseInt(limit.toString()),
                    sort: {
                        [sortBy]: sortType === "asc" ? 1 : -1,
                    },
                    populate: "owner",
                }

                // Create query filter
                const query: VideoFilterQuery = { isPublished: true }
                if (userId) {
                    query.owner = userId
                }

                // Type assertion for paginate function (since it's added via plugin)
                const videoModel = Video as any
                const videos = await videoModel.paginate(query, options)

                return {
                    videos: videos.docs,
                    totalPages: videos.totalPages,
                    totalVideos: videos.totalDocs,
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
            { title, description }: { title: string; description: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                // Note: In a real implementation, you would need to handle file uploads separately
                // This is a simplified version
                const video = await Video.create({
                    title,
                    description,
                    owner: userId,
                    isPublished: true,
                    // These would come from file uploads in real implementation
                    videoFile: { url: "placeholder", public_id: "placeholder" },
                    thumbnail: { url: "placeholder", public_id: "placeholder" },
                    duration: 0,
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
