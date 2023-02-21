const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const Msg = require('./models/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUser,
} = require('./utils/users');
const mongoose = require('mongoose');
const mongoDB =
  'mongodb+srv://Sai123:Sai123@wod1.ufyby56.mongodb.net/messages?retryWrites=true&w=majority';
mongoose.connect(mongoDB).then(() => {
  console.log('Connected');
});
const app = express();

const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Admin';

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Msg.aggregate([
    { $match: { to: room } },
    { $group: { _id: '$date' } },
  ]);
  return roomMessages;
}

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    Msg.find({ room: room }).then((result) => {
      socket.emit('output-messages', result);
    });
    let roomMessages = getLastMessagesFromRoom(room);
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit('message', formatMessage(botName, 'Welcome to chat room'));

    //When a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    io.to(user.room).emit('output-messages', roomMessages);
    //send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUser(user.room),
    });
  });

  //when a user disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );
      //send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUser(user.room),
      });
    }
  });

  //listen for msg
  socket.on('chatMessage', (msg, room) => {
    const user = getCurrentUser(socket.id);
    const message = new Msg({
      username: user.username,
      text: msg,
      room: user.room,
    });
    message.save().then(() => {
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log('Server running'));
