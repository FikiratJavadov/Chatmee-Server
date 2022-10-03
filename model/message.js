const mongoose = require("mongoose");

//? When we get all messages, we can check if messages get by sender , then this messages stay unread(true)
//?  but if it got read by another user then we should trigger read to true

//Todo We can see if the user read message send by another user

const messageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Please provide content for your message!"],
      trim: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
