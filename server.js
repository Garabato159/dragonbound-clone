const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};
let turn = null;

io.on("connection", socket => {
  players[socket.id] = {
    x: Object.keys(players).length === 0 ? 100 : 700,
    y: 320
  };

  if (!turn) turn = socket.id;
  io.emit("state", { players, turn });

  socket.on("shoot", data => {
    if (socket.id !== turn) return;

    io.emit("projectile", {
      from: socket.id,
      angle: data.angle,
      power: data.power
    });

    turn = Object.keys(players).find(id => id !== socket.id);
    io.emit("state", { players, turn });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    turn = Object.keys(players)[0] || null;
    io.emit("state", { players, turn });
  });
});

http.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
