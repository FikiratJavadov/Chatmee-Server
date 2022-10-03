const multer = require("multer");
const path = require("path");
const GlobalError = require("../error/GlobalError");

module.exports = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `tour-${Date.now()}.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    console.log(file.originalname);
    let ext = path.extname(file.originalname);
    console.log(ext);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new GlobalError("Please upload supported file."), false);
      return;
    }

    cb(null, true);
  },
});
