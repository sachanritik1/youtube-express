import { gql } from "graphql-tag"

export const userTypeDefs = gql`
    type Url {
        url: String
        public_id: String
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        fullName: String!
        avatar: Url
        coverImage: Url
        watchHistory: [Video]
        createdAt: String
        updatedAt: String
    }

    type AuthResponse {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    type Query {
        me: User
        getUser(username: String!): User
        getWatchHistory: [Video]
    }

    type Mutation {
        register(
            username: String!
            email: String!
            fullName: String!
            password: String!
        ): AuthResponse

        login(username: String, email: String, password: String!): AuthResponse

        logout: Boolean

        refreshToken(refreshToken: String!): AuthResponse

        changePassword(oldPassword: String!, newPassword: String!): Boolean

        updateUserDetails(fullName: String): User

        updateUserAvatar(avatarUrl: String!, publicId: String!): User

        updateUserCoverImage(coverImageUrl: String!, publicId: String!): User
    }
`
