import { useState, useRef } from "react";
import ChatBox from "./ChatBox";

export default function RoomMenu({ email }) {
  const [showChat, setShowChat] = useState(true);
  const [roomKey, setRoomKey] = useState("12345");
  const roomKeyInputRef = useRef(null);

  const url = "http://localhost:8080/api/";

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
