const path = require('path');

//Check File type
exports.checkFileTypeImg = (file) => {
    //Allowed extensions
    const fileTypes = /jpeg|jpg|png/;

    //Check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    // Check mime
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extName) {
        return true;
    } else {
        return false;
    }
}

//Check File Size Limit
exports.checkFileSizeLimit = (size, limit) => {
    if (size >= limit) {
        return false; //file size is greater than limit
    } else {
        return true;
    }
}