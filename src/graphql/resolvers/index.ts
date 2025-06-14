import { userResolvers } from "./user.resolver"
import { videoResolvers } from "./video.resolver"
import { commentResolvers } from "./comment.resolver"
import { likeResolvers } from "./like.resolver"
import { playlistResolvers } from "./playlist.resolver"

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...videoResolvers.Query,
        ...commentResolvers.Query,
        ...likeResolvers.Query,
        ...playlistResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...videoResolvers.Mutation,
        ...commentResolvers.Mutation,
        ...likeResolvers.Mutation,
        ...playlistResolvers.Mutation,
    },
}
