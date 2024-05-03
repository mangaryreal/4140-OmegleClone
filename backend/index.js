const express = require("express");
const http = require("http");

const app = express();
const cors = require("cors");
app.use(cors())

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ limit: '10gb', extended: true }));

const register = require("./api/register");
app.use(register);

const login = require("./api/login");
app.use(login);

const protected = require('./api/protected');
app.use(protected);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

var users = {};

var socketToRoom = {};

io.on('connection', socket => {
  socket.on("send message", (username, message, userID) => {
    let roomID = null;
    for (const key in users) {
      const room = users[key];
      const userInRoom = room.users.find(user => user.userID === userID);
      if (userInRoom) {
        roomID = key;
        break;
      }
    }
  
    if (roomID) {
      const usersInRoom = users[roomID].users;
      usersInRoom.forEach(user => {
        io.to(user.socketID).emit("new message", username, message, userID);
      });
    }
  });

  socket.on("join room", (roomSize, userID, username, roomType) => {
    // If you want to add topic for room pairing, 
    // then you could add a new variable, and also for the .find part
    const intRoomSize = parseInt(roomSize)
    // Find a room with the same room size
    let roomID = Object.keys(users).find(
      key => users[key].roomSize === intRoomSize 
        && key !== socketToRoom[socket.id] 
        && users[key].roomSize > users[key].users.length 
        && roomType === users[key].roomType
    );
  
    if (roomID) {
      // Room with the same size exists
      users[roomID].users.push({ socketID: socket.id, userID, username });
    } else {
      // Create a new room with the specified size
      const newRoomID = generateRoomID();
      users[newRoomID] = { roomSize: intRoomSize, roomType: roomType, users: [{ socketID: socket.id, userID, username }] };
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

    usersInThisRoom.forEach((user) => {
      socket.to(user.socketID).emit("new user joined", {
        userID,
        username,
        socketID: socket.id
      })
    })
  
    socket.emit("all users", usersInThisRoom, roomID);
  });


  socket.on("sending signal", payload => {
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
  });

  socket.on("disconnectTextChat", (roomID, userID) => {
    if (roomID === 0) return;
    const room = users[roomID];
    if (room) {
      const leftUser = room.users.filter(user => user.userID === userID);
      room.users = room.users.filter(user => user.userID !== userID);
      if (room.users.length === 0) {
        delete users[roomID];
      } else {
        room.users.forEach(user => {
          io.to(user.socketID).emit("userLeft", leftUser[0]?.username);
        });
      }
    }
  })

  socket.on('disconnect', () => {
    // console.log("Hello, someone disconnecting");
    const roomID = socket.roomID;
    const room = users[roomID];
    if (room) {
      room.users = room.users.filter(user => user.socketID !== socket.id);
      if (room.users.length === 0) {
        delete users[roomID];
      } else {
        room.users.forEach(user => {
          io.to(user.socketID).emit("userLeftDisconnect");
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

app.get('/', (req, res) => {
  res.send(users)
})