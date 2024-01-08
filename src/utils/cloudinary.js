import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        console.log("File uploaded on cloudinary", response.url)
        return response.url
    } catch (err) {
        console.log("File upload on cloudinary failed" + err)
    } finally {
        fs.unlink(localFilePath, (err) => {
            if (err) throw err
            console.log("path/file.txt was deleted")
        })
    }
}
