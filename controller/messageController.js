const { asyncCatch } = require("../utils/asyncCatch");
const User = require("../model/user");
const Chat = require("../model/chat");
const Message = require("../model/message");
const GlobalError = require("../error/GlobalError");

exports.getAllMessages = asyncCatch(async (req, res, next) => {
  const chatId = req.params.chatId;

  if (!chatId) return next(new GlobalError("Please provide a chat id", 400));

  let messages = await Message.find({ chat: chatId })
    .populate("sender")
    .populate("chat");

  messages = await User.populate(messages, { path: "chat.users" });

  res.json({ success: true, data: { messages } });
});

exports.sendMessage = asyncCatch(async (req, res, next) => {
  const { chat, content } = req.body;

  if (!chat || !content)
    return next(
      new GlobalError("Please provide chat and content for message", 400)
    );

  const newMessage = {
    content: req.body.content,
    sender: req.user._id,
    chat: req.body.chat,
  };

  let message = await Message.create(newMessage);
  message = await message.populate("sender");
  await Chat.findByIdAndUpdate(chat, { lastMessage: message._id });
  message = await message.populate("chat");
  message = await User.populate(message, { path: "chat.users" });
  message = await message.populate("chat.lastMessage");

  res.json({ success: true, data: { message } });
});

// exports.readMessage = asyncCatch(async (req, res, next) => {

  



//   res.json({ success: true, data: { message } });
// });
