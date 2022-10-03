const mongoose = require("mongoose");

//Todo Implement model which will strore the total nomber of unread messages per chat.

const chatSchema = mongoose.Schema(
  {
    chatName: {
      type: String,
    },

    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      validate: [
        (v) => Array.isArray(v) && v.length > 1,
        "Please add at least two person to create the chat",
      ],
    },

    isGroupChat: {
      type: Boolean,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
  },
  { timestamps: true }
);

// chatSchema.pre("save", function (next) {
//   if (this.users.length > 2) {
//     this.isGroupChat = true;
//   } else {
//     this.isGroupChat = false;
//   }
//   next();
// });

//* Validate users fiels
function atLeastTwoElement(users) {
  if (users.length < 2) {
    return false;
  } else {
    return true;
  }
}

const Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
