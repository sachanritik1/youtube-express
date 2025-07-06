import { createUploadthing, type FileRouter } from "uploadthing/express"

const f = createUploadthing()

export const uploadRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    youtubeVideoUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
        video: {
            maxFileSize: "1GB",
            maxFileCount: 1,
        },
    }).onUploadComplete((data) => {
        console.log("upload completed", data)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
