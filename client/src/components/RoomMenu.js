import { useState, useRef } from "react";
import ChatBox from "./ChatBox";

export default function RoomMenu({ email }) {
  const [showChat, setShowChat] = useState(false);
  const [roomKey, setRoomKey] = useState("");
  const roomKeyInputRef = useRef(null);

  const url = "http://localhost:8080/api/";

  // grab open room
  const createRoom = async () => {
    try {
      const response = await fetch(`${url}createRoom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Room Created: ", data.roomKey);
        setRoomKey(data.roomKey);
        setShowChat(true);
      } else {
        console.error("Failed to create room:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  // join active room
  const joinRoom = async (enteredRoomKey) => {
    console.log(enteredRoomKey);
    try {
      const response = await fetch(`${url}joinRoom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enteredRoomKey }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Room Joined: ", data.enteredRoomKey);
        setRoomKey(data.roomKey);
        setShowChat(true);
      } else {
        console.error("Failed to join room:", response.statusText);
        roomKeyInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error joining room: ", error);
    }
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
            <input
              type="text"
              placeholder="Enter room key"
              id="room-key-input"
              ref={roomKeyInputRef}
              onKeyDown={handleKeyPress}
            ></input>
            <button onClick={() => joinRoom(roomKeyInputRef.current.value)}>
              Join Room
            </button>
          </>
        ) : (
          <>
            <p>Room Key: {roomKey ? roomKey : roomKeyInputRef.current.value}</p>
            <button onClick={() => copyToClipboard(roomKey)}>
              Copy to Clipboard
            </button>
            <button onClick={leaveRoom}>Leave Room</button>
          </>
        )}
      </div>
      {showChat && <ChatBox email={email} />}
    </>
  );
}
