import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        console.log("File uploaded on cloudinary", response.url)
        return response
    } catch (err) {
        // remove the locally saved file as we don't need it anymore
        fs.unlinkSync(localFilePath)
        console.log("File upload on cloudinary failed" + err)
    }
}
