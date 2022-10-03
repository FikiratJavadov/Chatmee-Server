const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const { privateRoute } = require("../middleware/privateRoute");

router.get("/:chatId", privateRoute, messageController.getAllMessages);
router.post("/", privateRoute, messageController.sendMessage);
router.patch("/read", privateRoute, messageController.readMessage);

module.exports = router;
