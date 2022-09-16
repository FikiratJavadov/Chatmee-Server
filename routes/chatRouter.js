const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { privateRoute } = require("../middleware/privateRoute");

router.get("/", privateRoute, chatController.getAllChats);
router.post("/", privateRoute, chatController.createChat);

module.exports = router;
