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

    type Mutation {
        publishVideo(title: String!, description: String!): Video

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
