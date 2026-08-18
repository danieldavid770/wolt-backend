const cloudinary = require("../config/cloudinary");

const uploadImageBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "wolt/profile-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadImageBuffer,
};
