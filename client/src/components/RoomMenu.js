import { useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

export default function RoomMenu({ username }) {
  const roomKeyInputRef = useRef(null);
  const {roomKey, createRoom, joinRoom, leaveRoom} = useSocket();

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

  return (
    <>
      <div className="room-tools">
        {!roomKey ? (
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
