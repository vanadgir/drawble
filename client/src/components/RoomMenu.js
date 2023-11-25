import { useState, useRef } from "react";
import { io } from "socket.io-client";
import GameBox from "./GameBox";

export default function RoomMenu({ username }) {
  const [showChat, setShowChat] = useState(false);
  const [roomKey, setRoomKey] = useState("");
  const roomKeyInputRef = useRef(null);

  // simple random string generator
  function generateRandomString(length) {
    const alphanumericCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(
        Math.random() * alphanumericCharacters.length
      );
      result += alphanumericCharacters.charAt(randomIndex);
    }

    return result;
  }

  // create new room
  const createRoom = () => {
    const roomKey = generateRandomString(12);
    setRoomKey(roomKey);
    setShowChat(true);
  };

  // join active room
  const joinRoom = (enteredRoomKey) => {
    const socket = io("http://localhost:8080");

    socket.emit("check-rooms", enteredRoomKey, (isRoomExists) => {
      if (isRoomExists) {
        setRoomKey(enteredRoomKey);
        setShowChat(true);
        roomKeyInputRef.current.value = enteredRoomKey;
        // socket.emit("new-user-join", {username, roomKey: enteredRoomKey})
      } else {
        alert("Room does not exist.");
      }
    });
  };

  // function for submitting form with Enter key
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const roomKey = roomKeyInputRef.current.value;
      joinRoom(roomKey);
    }
  };

  // send key to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Room Key copied to clipboard!");
  };

  // leave room and chat
  const leaveRoom = () => {
    setRoomKey("");
    setShowChat(false);
  };

  return (
    <>
      <div className="room-tools">
        {!showChat && !roomKey ? (
          <>
            <button onClick={createRoom}>Create Room</button>
            <span className="buttons">
              <input
                type="text"
                placeholder="Room Key..."
                id="room-key-input"
                ref={roomKeyInputRef}
                onKeyDown={handleKeyPress}
              ></input>
              <button onClick={() => joinRoom(roomKeyInputRef.current.value)}>
                Join Room
              </button>
            </span>
          </>
        ) : (
          <>
            <p id="key-display">
              Room Key: {roomKey ? roomKey : roomKeyInputRef.current.value}
            </p>
            <span className="buttons">
              <button onClick={() => copyToClipboard(roomKey)}>
                Copy to Clipboard
              </button>
              <button onClick={leaveRoom}>Leave Room</button>
            </span>
          </>
        )}
      </div>
      {/* showChat && <GameBox username={username} roomKey={roomKey} /> */}
    </>
  );
}
