import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema"
import cors from "cors"
import { json } from "express"
import http from "http"
import { typeDefs } from "./schemas"
import { resolvers } from "./resolvers"
import { Express } from "express"
import { graphqlAuthMiddleware } from "./authMiddleware"
import { GraphQLResolverContext } from "./types"
import { createContext } from "./context"
import { GraphQLFormattedError } from "graphql"

export const setupGraphQLServer = async (
    app: Express,
    httpServer: http.Server
) => {
    const schema = makeExecutableSchema({ typeDefs, resolvers })

    const server = new ApolloServer<GraphQLResolverContext>({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        formatError: (formattedError) => {
            // Log error for server-side debugging
            console.error("GraphQL Error:", formattedError)

            // Return a cleaner error object for the client
            return {
                message: formattedError.message || "An error occurred",
                path: formattedError.path,
                extensions: {
                    code:
                        formattedError.extensions?.code ||
                        "INTERNAL_SERVER_ERROR",
                },
            } as GraphQLFormattedError
        },
    })

    await server.start()

    app.use(
        "/graphql",
        cors<cors.CorsRequest>({
            origin: process.env.CLIENT_BASE_URL,
            credentials: true,
        }),
        json(),
        graphqlAuthMiddleware,
        expressMiddleware(server, {
            context: async ({ req, res }) => createContext({ req, res }),
        })
    )

    console.log(
        `🚀 GraphQL Server ready at http://localhost:${process.env.PORT}/graphql`
    )

    return { server }
}
