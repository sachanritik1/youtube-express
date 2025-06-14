import { gql } from "graphql-tag"

export const playlistTypeDefs = gql`
    type Playlist {
        _id: ID!
        name: String!
        description: String
        videos: [Video]
        owner: User!
        createdAt: String
        updatedAt: String
    }

    type Query {
        getPlaylist(playlistId: ID!): Playlist
        getUserPlaylists(userId: ID!): [Playlist]
    }

    type Mutation {
        createPlaylist(name: String!, description: String): Playlist

        updatePlaylist(
            playlistId: ID!
            name: String
            description: String
        ): Playlist

        deletePlaylist(playlistId: ID!): Boolean

        addVideoToPlaylist(playlistId: ID!, videoId: ID!): Playlist

        removeVideoFromPlaylist(playlistId: ID!, videoId: ID!): Playlist
    }
`
