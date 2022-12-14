const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });
const errorHandler = require("./error/errorHandler");
const GlobalError = require("./error/GlobalError");

//* Models
const User = require("./model/user");
const Message = require("./model/message");
const Chat = require("./model/chat");

const cors = require("cors");
//*Routers
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const messageRouter = require("./routes/messageRouter");

//* SOCKET IO
const socket = require("socket.io");

//* App.js
const app = express();

//* Global Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//!Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);

app.use((req, res, next) => {
  const message = new GlobalError(`The ${req.originalUrl} does not exist`);
  next(message);
});

app.use(errorHandler);

//!users obj
const users = {};

//!MongoDB connection
const PORT = process.env.PORT || 5000;
const DB = process.env.DB_URL.replace("<password>", process.env.DB_PASSWORD);
mongoose.connect(DB, (err) => {
  if (err) return console.log(err);
  console.log("MongoDb connected");

  const server = app.listen(PORT, () =>
    console.log(`Server running in PORT: ${PORT}`)
  );
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("user-access", (user) => {
      if (!user) return;
      socket.join(user._id);
      console.log(`Server connected with a name: ${user.name}`);
      socket.emit("access-ok", user.name);

      users[socket.id] = {
        id: user._id,
        typing: false,
      };

      io.emit("online-status", users);
    });

    socket.on("join-room", (roomId) => {
      console.log(`User join room: ${roomId}`);
      socket.join(roomId);
    });

    socket.on("typing", (roomId) => {
      console.log("typing", roomId);
      socket.to(roomId).emit("typing", roomId);
    });

    socket.on("stop-typing", (roomId) => {
      console.log("bye", roomId);
      socket.to(roomId).emit("stop-typing", roomId);
    });

    socket.on("send-message", (message) => {
      console.log("Sending message");
      if (!message.chat || !message.sender) return;
      console.log(message);

      const users = message.chat.users;
      const sender = message.sender;

      for (let user of users) {
        if (user._id === sender._id) continue;
        console.log("nu da");
        socket.to(user._id).emit("got-message", message);
      }
    });

    //* Diconnect user
    socket.on("disconnect", async function () {
      console.log(`Got disconnect by room!`);
      delete users[socket.id];

      io.emit("online-status", users);
    });
  });
});

//! Running the server
