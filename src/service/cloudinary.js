// service/cloudinary.js
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const uploadOnCloudinary = async (localFilePath) =>{
    if(!localFilePath) return null;

    try {
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary");
        fs.unlinkSync(localFilePath);

        return response
    } 
    catch(error){
        fs.unlinkSync(localFilePath);
        console.log("Error uploading file on Cloudinary: ", error);
        return null;
    }
}

const destroyFromCloudinary = async (publicId) =>{
    if(!publicId) return null;

    try {
        // delete the file from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId);

        console.log("file is deleted from cloudinary ");
        return response;
    } 
    catch(error){
        console.log("Error deleting file from Cloudinary: ", error);
        return null;
    }
}

export {
    uploadOnCloudinary,
    destroyFromCloudinary
}