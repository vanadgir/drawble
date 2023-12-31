import { useEffect, useState, useRef } from "react";
import DrawCanvas from "./DrawCanvas";
import { useSocket } from "../contexts/SocketContext";

// main chat box component
export default function GameBox({ username, roomKey }) {
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);
  const messageInputRef = useRef(null);
  const {socket} = useSocket();

  // function for submitting form
  const handleSubmit = (event) => {
    event.preventDefault();
    const text = messageInputRef.current.value;
    if (!text || !roomKey) return;

    socket.emit("new-message", { username, text, roomKey });
    messageInputRef.current.value = "";
  };

  // function for submitting form with Enter key
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // function for adding new messages to chat
  const displayMessage = (name, text) => {
    const message = {
      name,
      text,
    };

    // update messages list
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  useEffect(() => {
    // focus on latest message
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // socket connection events
  useEffect(() => {
    socket.on("user-connected", ({ username }) => {
      displayMessage("SYSTEM", `${username} has connected.`);
    });

    // receive broadcasted message
    socket.on("receive-message", (data) => {
      displayMessage(data.username, data.text);
    });

    // user disconnect notification
    socket.on("user-disconnected", (disconnectedUser) => {
      displayMessage("SYSTEM", `${disconnectedUser} has disconnected.`);
    });

    return () => {
      socket.off("user-connected");
      socket.off("receive-message");
      socket.off("user-disconnected");
    }
  }, [username, roomKey]);

  return (
    <div className="game-container">
      <DrawCanvas />
      <div className="chat-container">
        <div ref={chatBoxRef} id="chat-box">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <div className="username">{message.name}:</div>
              <div className="message-text">{message.text}</div>
            </div>
          ))}
        </div>
        <form id="message-form" onSubmit={handleSubmit}>
          <textarea
            id="message-input"
            ref={messageInputRef}
            placeholder={`Chatting as ${username}`}
            onKeyDown={handleKeyPress}
            maxLength="160"
          ></textarea>
        </form>
      </div>
    </div>
  );
}
