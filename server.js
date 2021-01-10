const http = require("http");

const express = require("express");
// const app = require("./app");
const app = express();
const mongoose = require("mongoose");
const itemSchema = require("./model/listchat");
const Users = require("./model/users");
// app.use(express.static("public"));

// const urlLocal = "mongodb://localhost:27017/admin";
const urlLocal =
  "mongodb+srv://tan:iakmEAeuJskmhJyr@cluster0.ephpr.mongodb.net/node_mongodb?retryWrites=true&w=majority";
try {
  mongoose.connect(
    urlLocal,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("connected database chat ");
    }
  );
} catch (error) {
  console.log("could not connect");
}

const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://socketioclient.herokuapp.com/",
    // origin: "https://localhost:3000",
    methods: ["GET", "POST"],
  },
});

server.listen(port, () => console.log("Server running !" + port));
const arrUser = [];
io.on("connection", (socket) => {
  console.log(socket.id + " đã kết nối !");
  // socket.emit("an event", { some: "data" });
  // console.log(socket.rooms);
  // socket.join("room1");
  // console.log(socket.rooms); // Set { <socket.id>, "room1" }
  socket.on("signup", async (username, passwold) => {
    const usersignup = new Users({
      username: username,
      passwold: passwold,
    });
    try {
      await usersignup.save();
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("login", (username, passwold) => {
    // if (arrUser.indexOf(data) >= 0) {
    //   socket.emit("dktenthatbai");
    // }
    console.log("đã gửi data: " + username + " - " + passwold);
    Users.find({ username: username, passwold: passwold })
      .exec()
      .then((data) => {
        console.log("req: " + data[0]);
        console.log(data[0].username);
        if (data[0].username == username && data[0].passwold == passwold) {
          arrUser.push(username);
          socket.Username = username;
          socket.emit("dktenthanhcong", username);
          io.sockets.emit("dsuser", arrUser);
          //lấy nội dung chat hiện tại gửi về user đăng nhập thành công
          itemSchema
            .find()
            .exec()
            .then((doc) => {
              io.sockets.emit("server-send-data", doc);
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ error: err });
            });
        } else {
          socket.emit("dktenthatbai");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    // else {
    //   arrUser.push(data);
    //   socket.Username = data;
    //   socket.emit("dktenthanhcong", data);
    //   io.sockets.emit("dsuser", arrUser);
    //   //lấy nội dung chat hiện tại gửi về user đăng nhập thành công
    //   itemSchema
    //     .find()
    //     .exec()
    //     .then((doc) => {
    //       console.log(doc);
    //       io.sockets.emit("server-send-data", doc);
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       res.status(500).send({ error: err });
    //     });
    // }
  });

  socket.on("logout", () => {
    arrUser.splice(arrUser.indexOf(socket.Username), 1);
    socket.broadcast.emit("dsuser", arrUser);
  });

  socket.on("sendmsg", async (data) => {
    //lưu itemchat vào database
    const listchats = new itemSchema({
      name: socket.Username,
      content: data,
    });
    try {
      await listchats.save();
      //lấy database gửi về cho client
      itemSchema
        .find()
        .exec()
        .then((doc) => {
          console.log(doc);
          io.sockets.emit("server-send-data", doc);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ error: err });
        });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnecting", () => {
    console.log(socket.id + " đã ngắt kết nối !");
    arrUser.splice(arrUser.indexOf(socket.Username), 1);
    socket.broadcast.emit("dsuser", arrUser);
  });
});
