const socket = io();

const nicknamePart = document.getElementById("nickname");
const nicknameForm = nicknamePart.querySelector("form");
const newPart = document.getElementById("new");
const newForm = newPart.querySelector("form");
const searchPart = document.getElementById("search");
const searchForm = searchPart.querySelector("form");
const roomPart = document.getElementById("room");
const roomTitle = roomPart.querySelector("h3");
const leaveBtn = document.getElementById("leave");
const roomForm = roomPart.querySelector("form");
const roomUl = roomPart.querySelector("ul");
let roomName = null;

newPart.hidden = true;
searchPart.hidden = true;
roomPart.hidden = true;

// leave Btn

function onLeave() {
  socket.emit("leave_room", roomName);
  roomName = null;
}

leaveBtn.addEventListener("click", onLeave);

//nickname

function onNicknameSubmit(event) {
  event.preventDefault();
  const input = event.target.querySelector("input");
  socket.emit("nickname", input.value);
  input.value = "";
  nicknamePart.hidden = true;
  newPart.hidden = false;
  searchPart.hidden = false;
}

nicknameForm.addEventListener("submit", onNicknameSubmit);

//New

function showRoom(userCount) {
  roomTitle.innerText = `${roomName}(${userCount})`;
}

function onNewSubmit(event) {
  event.preventDefault();
  const input = newForm.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", roomName, showRoom); //여기다 done 필요한곳
  newPart.hidden = true;
  searchPart.hidden = true;
  roomPart.hidden = false;
}

newForm.addEventListener("submit", onNewSubmit);

//Search room

function onSearchSubmit(event) {
  event.preventDefault();
  const input = event.target.querySelector("input");
}

searchForm.addEventListener("submit", onSearchSubmit);

//inRoom

function paintMessage(text) {
  const li = document.createElement("li");
  li.innerText = text;
  roomUl.append(li);
}

function onMessageSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  const value = input.value;
  socket.emit("message", value, roomName);
  paintMessage(`You: ${value}`);
  input.value = "";
}

roomForm.addEventListener("submit", onMessageSubmit);

// socket.on

socket.on("welcome", (nickname, userCount) => {
  paintMessage(`${nickname} entered`);
  showRoom(userCount);
});

socket.on("bye", (nickname) => {
  paintMessage(`${nickname} has left`);
});

socket.on("message", (nickname, text) => {
  paintMessage(`${nickname}: ${text}`);
});

socket.on("list_room", (rooms) => {
  rooms.map((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    const ul = searchPart.querySelector("ul");
    ul.append(li);
    li.addEventListener("click", () => {
      roomName = room;
      socket.on("enter_room", roomName);
      searchPart.hidden = true;
    });
  });
});
