const { asyncCatch } = require("../utils/asyncCatch");
const User = require("../model/user");
const Chat = require("../model/chat");
const GlobalError = require("../error/GlobalError");

//* Get all Chats
exports.getAllChats = asyncCatch(async (req, res, next) => {
  const chats = await Chat.find({ users: req.user._id })
    .populate("users")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: { chats } });
});

//* Create the chat
exports.createChat = asyncCatch(async (req, res, next) => {
  const { friendId } = req.body;

  if (!friendId)
    return next(new GlobalError("Friend Id is not provided!", 400));

  const chat = await Chat.findOne({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: friendId } } },
    ],
  }).populate("users");

  if (chat) {
    return res.status(200).json({ success: true, data: { chat } });
  }

  const chatData = {
    chatName: req.user.name,
    users: [friendId, req.user._id],
  };

  let createdChat = await Chat.create(chatData);
  createdChat = await createdChat.populate("users");

  res.json({ success: true, data: { chat: createdChat } });
});
