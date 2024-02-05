const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_API_SECRET
});


const cloudinaryUploadImg = async (filetoUpload) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(filetoUpload, (result) => {
      resolve(
        { url: result.secure_url }, { resource_type: "auto" }
      )
    });
  });
}

module.exports = cloudinaryUploadImg;