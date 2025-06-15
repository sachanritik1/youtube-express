import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { userTypeDefs } from "./schemas/user.schema"
import { videoTypeDefs } from "./schemas/video.schema"
import { commentTypeDefs } from "./schemas/comment.schema"
import { likeTypeDefs } from "./schemas/like.schema"
import { playlistTypeDefs } from "./schemas/playlist.schema"
import { userResolvers } from "./resolvers/user.resolver"
import { videoResolvers } from "./resolvers/video.resolver"
import { commentResolvers } from "./resolvers/comment.resolver"
import { likeResolvers } from "./resolvers/like.resolver"
import { playlistResolvers } from "./resolvers/playlist.resolver"
import { createContext } from "./context"
import { graphqlAuthMiddleware } from "./authMiddleware"
import { Express } from "express"
import { upload } from "../middlewares/multer.middleware"

// Deep merge resolvers
const mergeResolvers = (...resolvers: any[]) => {
    return resolvers.reduce((acc, resolver) => {
        Object.keys(resolver).forEach((key) => {
            if (!acc[key]) {
                acc[key] = {}
            }

            acc[key] = { ...acc[key], ...resolver[key] }
        })

        return acc
    }, {})
}

export const setupApolloServer = async (app: Express) => {
    // Combine all type definitions
    const typeDefs = [
        userTypeDefs,
        videoTypeDefs,
        commentTypeDefs,
        likeTypeDefs,
        playlistTypeDefs,
    ]

    // Combine all resolvers
    const resolvers = mergeResolvers(
        userResolvers,
        videoResolvers,
        commentResolvers,
        likeResolvers,
        playlistResolvers
    )

    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (formattedError, error) => {
            // Customize error handling if needed
            return {
                message: formattedError.message,
                locations: formattedError.locations,
                path: formattedError.path,
                extensions: {
                    code:
                        formattedError.extensions?.code ||
                        "INTERNAL_SERVER_ERROR",
                },
            }
        },
    })

    // Start the server
    await server.start()

    // Apply GraphQL middleware
    app.use(
        "/graphql",
        graphqlAuthMiddleware,
        expressMiddleware(server, {
            context: createContext,
        })
    )

    return server
}
