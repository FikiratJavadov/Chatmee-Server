const mongoose = require("mongoose");

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
