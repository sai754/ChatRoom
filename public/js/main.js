const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();

//get username, room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//join chatroom
socket.emit('joinRoom', { username, room });
//message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  //scrolling
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('output-messages', (message) => {
  //outputMessage(message);
  if (message.length) {
    message.forEach((message) => {
      outputMessage(message);
    });
  }
  //scrolling
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //get the text
  const msg = e.target.elements.msg.value;
  //emit message
  socket.emit('chatMessage', msg);

  //clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//output msg to DOM
function outputMessage(message) {
  const div = document.createElement('div');

  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}`;
}
