const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
// const socket = require("socket.io");
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


const users = {};

const socketToRoom = {};

io.on('connection', socket => {
  socket.on("join room", (roomSize, userID, username) => {
    const intRoomSize = parseInt(roomSize)
    // Find a room with the same room size
    let roomID = Object.keys(users).find(
      key => users[key].roomSize === intRoomSize && key !== socketToRoom[socket.id]
    );
  
    if (roomID) {
      // Room with the same size exists
      users[roomID].users.push({ socketID: socket.id, userID, username });
    } else {
      // Create a new room with the specified size
      const newRoomID = generateRoomID();
      users[newRoomID] = { roomSize: intRoomSize, users: [{ socketID: socket.id, userID, username }] };
      roomID = newRoomID;
    }
  
    socketToRoom[socket.id] = roomID;
  
    const usersInThisRoom = users[roomID].users
      .filter(user => user.socketID !== socket.id)
      .map(user => ({
        userID: user.userID,
        username: user.username,
        socketID: user.socketID
      }));
  
    socket.emit("all users", usersInThisRoom);
  });


  socket.on("sending signal", payload => {
    console.log("Hello, someone sending signal");
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning signal", payload => {
    console.log("Hello, server returns signal");
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('disconnect', () => {
    console.log("Hello, someone disconnecting");
    const roomID = socketToRoom[socket.id];
    const room = users[roomID];
    if (room) {
      room.users = room.users.filter(user => user.socketID !== socket.id);
      if (room.users.length === 0) {
        delete users[roomID];
      } else {
        room.users.forEach(user => {
          io.to(user.socketID).emit("userLeft");
        });
      }
    }
  });
});

function generateRoomID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let roomID = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomID += characters.charAt(randomIndex);
  }

  return roomID;
}

server.listen(3001, () => console.log('server is running on port 3001'));


