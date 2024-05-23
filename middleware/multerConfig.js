const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //for validating the fileType
    const allowedfile = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedfile.includes(file.mimetype)) {
      cb(new Error(`${file.mimetype} isn't supported`));
    } else {
      cb(null, "./uploadFile");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
module.exports = {
  multer,
  storage,
};
