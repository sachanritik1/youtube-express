import { gql } from "graphql-tag"

export const likeTypeDefs = gql`
    enum LikeableType {
        VIDEO
        COMMENT
        TWEET
    }

    type Like {
        _id: ID!
        video: Video
        comment: Comment
        tweet: ID
        likedBy: User!
        createdAt: String
        updatedAt: String
    }

    type PaginatedLikedVideos {
        likedVideos: [Like]
        totalPages: Int
        totalVideos: Int
    }

    type Query {
        getLikes(type: LikeableType!, id: ID!): [Like]
        getLikedVideos(page: Int, limit: Int): PaginatedLikedVideos
    }

    type Mutation {
        toggleLike(type: LikeableType!, id: ID!): Boolean
        toggleVideoLike(videoId: ID!): Boolean
        toggleCommentLike(commentId: ID!): Boolean
        toggleTweetLike(tweetId: ID!): Boolean
    }
`
