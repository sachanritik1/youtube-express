import { gql } from "graphql-tag"
import { userTypeDefs } from "./user.schema"
import { videoTypeDefs } from "./video.schema"
import { commentTypeDefs } from "./comment.schema"
import { likeTypeDefs } from "./like.schema"
import { playlistTypeDefs } from "./playlist.schema"

const rootTypeDefs = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`

export const typeDefs = [
    rootTypeDefs,
    userTypeDefs,
    videoTypeDefs,
    commentTypeDefs,
    likeTypeDefs,
    playlistTypeDefs,
]
