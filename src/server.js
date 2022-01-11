import http from "http";
import SocketIO from "socket.io";
import express, { text } from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);

const wsServer = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countUser(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName).size;
}

wsServer.on("connection", (socket) => {
  socket.on("nickname", (nicknameValue) => {
    socket["nickname"] = nicknameValue;
    socket.emit("list_room", publicRooms());
  });
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));
    showRoom(countUser(roomName));
  });
  socket.on("leave_room", (roomName) => {
    socket.to(roomName).emit("bye", socket.nickname);
    socket.leave(roomName);
  });
  socket.on("message", (text, roomName) => {
    socket.to(roomName).emit("message", socket.nickname, text);
  });
  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });
});

const PORT = 5000;
httpServer.listen(PORT, () => console.log(`Listening on port : ${PORT}🌍`));
