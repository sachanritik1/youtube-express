# GraphQL API Documentation

This document provides an overview of the GraphQL API implemented for the YouTube Express project.

## Implementation Overview

The GraphQL layer has been implemented on top of the existing Express REST API. It uses:

-   **Apollo Server**: A production-ready GraphQL server that handles requests, authentication, and error handling.
-   **GraphQL Schema**: Defines the types, queries, and mutations available in the API.
-   **Resolvers**: Functions that handle the business logic for each query and mutation.

## Endpoints

-   **GraphQL API**: `/graphql`
-   **GraphQL Playground**: Access the GraphQL Playground at `/graphql` in your browser for interactive documentation and testing.

## Authentication

Authentication is handled through JWT tokens, the same as the REST API. To access protected routes:

1. Login or register to get an access token and refresh token
2. Include the access token in the Authorization header:
   `Authorization: Bearer YOUR_ACCESS_TOKEN`

The GraphQL server includes an authentication middleware that verifies the JWT token for protected operations while allowing public operations like login and registration.

## Available Queries and Mutations

### User Operations

#### Queries

-   `me`: Get the current authenticated user
-   `getUser(username: String!)`: Get user by username

#### Mutations

-   `register(username: String!, email: String!, fullName: String!, password: String!)`: Register a new user
-   `login(username: String!, email: String, password: String!)`: Login with username/email and password
-   `logout`: Logout the current user
-   `refreshToken(refreshToken: String!)`: Get a new access token using refresh token
-   `changePassword(oldPassword: String!, newPassword: String!)`: Change user's password
-   `updateUserDetails(fullName: String)`: Update user details

### Video Operations

#### Queries

-   `getVideo(videoId: ID!)`: Get a video by ID
-   `getAllVideos(page: Int, limit: Int, sortBy: String, sortType: String, userId: ID)`: Get all videos with pagination

#### Mutations

-   `publishVideo(title: String!, description: String!)`: Publish a new video
-   `updateVideo(videoId: ID!, title: String, description: String, thumbnail: String)`: Update a video
-   `deleteVideo(videoId: ID!)`: Delete a video
-   `togglePublishStatus(videoId: ID!)`: Toggle video publish status

### Comment Operations

#### Queries

-   `getVideoComments(videoId: ID!, page: Int, limit: Int)`: Get comments for a video

#### Mutations

-   `addComment(videoId: ID!, content: String!)`: Add a comment to a video
-   `updateComment(commentId: ID!, content: String!)`: Update a comment
-   `deleteComment(commentId: ID!)`: Delete a comment

### Like Operations

#### Queries

-   `getLikes(type: LikeableType!, id: ID!)`: Get likes for a video, comment, or tweet

#### Mutations

-   `toggleLike(type: LikeableType!, id: ID!)`: Toggle like status for a video, comment, or tweet

### Playlist Operations

#### Queries

-   `getPlaylist(playlistId: ID!)`: Get a playlist by ID
-   `getUserPlaylists(userId: ID!)`: Get all playlists for a user

#### Mutations

-   `createPlaylist(name: String!, description: String)`: Create a new playlist
-   `updatePlaylist(playlistId: ID!, name: String, description: String)`: Update a playlist
-   `deletePlaylist(playlistId: ID!)`: Delete a playlist
-   `addVideoToPlaylist(playlistId: ID!, videoId: ID!)`: Add a video to a playlist
-   `removeVideoFromPlaylist(playlistId: ID!, videoId: ID!)`: Remove a video from a playlist

## Example Queries

### Get Current User

```graphql
query {
    me {
        _id
        username
        email
        fullName
        avatar {
            url
        }
    }
}
```

### Login User

```graphql
mutation {
    login(username: "example", password: "password123") {
        accessToken
        refreshToken
        user {
            _id
            username
            email
        }
    }
}
```

### Get Video with Comments

```graphql
query {
    getVideo(videoId: "video_id_here") {
        _id
        title
        description
        views
        owner {
            username
            fullName
        }
        createdAt
    }
}
```

### Get Video Comments

```graphql
query {
    getVideoComments(videoId: "video_id_here", page: 1, limit: 10) {
        comments {
            _id
            content
            owner {
                username
            }
            createdAt
        }
        totalComments
        totalPages
    }
}
```

## Testing the GraphQL API

You can interact with the GraphQL API using the Apollo Sandbox that's available at the `/graphql` endpoint when your server is running. Here's how to test it:

1. Start your server:

    ```shell
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:5000/graphql`

3. Use the Apollo Sandbox interface to:
    - Browse the schema documentation
    - Compose and run queries/mutations
    - Set headers for authentication

### Setting Authentication Headers

For protected operations, set the Authentication header in the Apollo Sandbox:

1. Click on "Headers" at the bottom of the query editor
2. Add a header with:
    - Name: `Authorization`
    - Value: `Bearer YOUR_ACCESS_TOKEN`

### Using Variables

For operations that require variables:

```graphql
query GetVideo($videoId: ID!) {
    getVideo(videoId: $videoId) {
        _id
        title
        description
        owner {
            username
        }
    }
}
```

Variables:

```json
{
    "videoId": "your_video_id"
}
```
