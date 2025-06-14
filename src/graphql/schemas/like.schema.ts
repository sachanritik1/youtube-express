import { gql } from "graphql-tag"

export const likeTypeDefs = gql`
    enum LikeableType {
        VIDEO
        COMMENT
        TWEET
    }

    type Like {
        _id: ID!
        video: ID
        comment: ID
        tweet: ID
        likedBy: User!
        createdAt: String
        updatedAt: String
    }

    type Query {
        getLikes(type: LikeableType!, id: ID!): [Like]
    }

    type Mutation {
        toggleLike(type: LikeableType!, id: ID!): Boolean
    }
`
