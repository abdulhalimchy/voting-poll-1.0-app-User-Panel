const multer = require('multer');

//Init Upload variable
exports.upload = multer({
    storage: multer.diskStorage({})
});
