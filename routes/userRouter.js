const express = require("express");
const router = express.Router();
const authController = require("../controller/authContoller");
const { privateRoute } = require("../middleware/privateRoute");
const upload = require("../utils/multer");

router.post("/signup", upload.array("photo", 2), authController.signup);
router.post("/login", authController.login);

router.get("/search", privateRoute, authController.search);

module.exports = router;
