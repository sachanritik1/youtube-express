import { gql } from "graphql-tag"

export const videoTypeDefs = gql`
    type Video {
        _id: ID!
        videoFile: Url!
        thumbnail: Url!
        title: String!
        description: String!
        duration: Int!
        views: Int!
        isPublished: Boolean!
        owner: User!
        createdAt: String
        updatedAt: String
    }

    type PaginatedVideos {
        videos: [Video]
        currentPage: Int
        totalPages: Int
        totalVideos: Int
    }

    type Query {
        getVideo(videoId: ID!): Video
        getAllVideos(
            page: Int
            limit: Int
            sortBy: String
            sortType: String
            userId: ID
        ): PaginatedVideos
    }

    scalar Upload

    type Mutation {
        publishVideo(
            title: String!
            description: String!
            videoFile: Upload!
            thumbnail: Upload!
            duration: Int!
        ): Video

        updateVideo(
            videoId: ID!
            title: String
            description: String
            thumbnail: String
        ): Video

        deleteVideo(videoId: ID!): Boolean

        togglePublishStatus(videoId: ID!): Video
    }
`
