import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Click 'View API Keys' above to copy your Cloud name
        api_key: process.env.CLOUDINARY_API_KEY, // Click 'View API Keys' above to copy your API Key
        api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    const uploadOnCloudinary = async (localFilePath) => {
      try{
        if(!localFilePath) throw new Error('No file path provided');
        //Upload the file to Cloudinary
     const response=await  cloudinary.uploader.upload(localFilePath, {
          resource_type : 'auto', 
        });
        //File uploaded successfully
      //  console.log('File uploaded successfully:', response.url);
      fs.unlinkSync(localFilePath); // Delete the file from local storage after upload
        return response;
      }
      
      catch (error) {
        fs.unlinkSync(localFilePath); // Delete the file from local storage as the upload failed
        console.error('Error uploading file to Cloudinary:', error);
        return null; // Return null or handle the error as needed
      }
    }
    export {uploadOnCloudinary}