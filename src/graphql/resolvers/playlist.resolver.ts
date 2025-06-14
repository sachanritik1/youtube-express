import { Playlist } from "../../models/playlist.model"
import { ApiError } from "../../utils/ApiError"
import { GraphQLResolverContext, ResolverParent } from "../types"

export const playlistResolvers = {
    Query: {
        getPlaylist: async (
            _: ResolverParent,
            { playlistId }: { playlistId: string }
        ) => {
            try {
                const playlist = await Playlist.findById(playlistId)
                    .populate("owner")
                    .populate("videos")

                if (!playlist) {
                    throw new ApiError(404, "Playlist not found")
                }

                return playlist
            } catch (error) {
                throw error
            }
        },

        getUserPlaylists: async (
            _: ResolverParent,
            { userId }: { userId: string }
        ) => {
            try {
                const playlists = await Playlist.find({ owner: userId })
                    .populate("owner")
                    .populate("videos")

                return playlists
            } catch (error) {
                throw error
            }
        },
    },

    Mutation: {
        createPlaylist: async (
            _: ResolverParent,
            { name, description }: { name: string; description?: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const playlist = await Playlist.create({
                    name,
                    description,
                    owner: userId,
                    videos: [],
                })

                const populatedPlaylist = await Playlist.findById(
                    playlist._id
                ).populate("owner")

                return populatedPlaylist
            } catch (error) {
                throw error
            }
        },

        addVideoToPlaylist: async (
            _: ResolverParent,
            { playlistId, videoId }: { playlistId: string; videoId: string },
            { req }: GraphQLResolverContext
        ) => {
            try {
                const userId = req.user?.id
                if (!userId) {
                    throw new ApiError(401, "Unauthorized request")
                }

                const playlist = await Playlist.findById(playlistId)
                if (!playlist) {
                    throw new ApiError(404, "Playlist not found")
                }

                if (playlist.owner.toString() !== userId) {
                    throw new ApiError(
                        403,
                        "You are not authorized to modify this playlist"
                    )
                }

                // Check if video already exists in playlist
                if (playlist.videos.includes(videoId as any)) {
                    throw new ApiError(409, "Video already in playlist")
                }

                const updatedPlaylist = await Playlist.findByIdAndUpdate(
                    playlistId,
                    {
                        $push: { videos: videoId },
                    },
                    { new: true }
                )
                    .populate("owner")
                    .populate("videos")

                return updatedPlaylist
            } catch (error) {
                throw error
            }
        },
    },
}
