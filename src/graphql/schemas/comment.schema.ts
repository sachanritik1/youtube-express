import { gql } from "graphql-tag"

export const commentTypeDefs = gql`
    type Comment {
        _id: ID!
        content: String!
        video: ID!
        owner: User!
        createdAt: String
        updatedAt: String
    }

    type PaginatedComments {
        comments: [Comment]
        totalPages: Int
        totalComments: Int
    }

    type Query {
        getVideoComments(videoId: ID!, page: Int, limit: Int): PaginatedComments
    }

    type Mutation {
        addComment(videoId: ID!, content: String!): Comment

        updateComment(commentId: ID!, content: String!): Comment

        deleteComment(commentId: ID!): Boolean
    }
`
