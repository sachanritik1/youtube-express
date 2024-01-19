export const USER_DB = "User"
export const VIDEO_DB = "Video"
export const SUBSCRIPTION_DB = "Subscription"
export const PLAYLIST_DB = "Playlist"

export const ENV = "dev" //change this to "prod" when deploying to production
export const BASE_URL = ENV === "dev" ? "http://localhost:5000" : ""
