const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });
const errorHandler = require("./error/errorHandler");
const GlobalError = require("./error/GlobalError");

const cors = require("cors");
//*Routers
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const messageRouter = require("./routes/messageRouter");

//* SOCKET IO
const socket = require("socket.io");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json());

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
      console.log(users);

      io.emit("online-status", users);
    });

    socket.on("typing", (user) => {
      users[socket.id].typing = true;
      io.emit("online-status", users);
      socket.on("stop-typing", () => {
        users[socket.id].typing = false;
        io.emit("online-status", users);
        console.log("stop typing");
      });

      console.log(users);
    });

    socket.on("send-message", (message) => {
      console.log("Sending message");
      if (!message.chat || !message.sender) return;
      const users = message.chat.users;
      const sender = message.sender;

      for (let user of users) {
        if (user._id === sender._id) continue;
        console.log("nu da");
        socket.to(user._id).emit("got-message", message);
      }
    });

    //* Diconnect user
    socket.on("disconnect", function () {
      console.log("Got disconnect!");

      delete users[socket.id];

      io.emit("online-status", users);
    });
  });
});

//! Running the server
