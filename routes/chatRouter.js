const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { privateRoute } = require("../middleware/privateRoute");

router.get("/", privateRoute, chatController.getAllChats);
router.post("/", privateRoute, chatController.createChat);
router.patch("/:id", privateRoute, chatController.updateChat);

module.exports = router;
