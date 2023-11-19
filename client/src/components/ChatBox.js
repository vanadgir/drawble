import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// main chat box component
export default function ChatBox({ userEmail }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const chatBoxRef = useRef(null);
  const messageInputRef = useRef(null);
  const usernameRef = useRef(userEmail.split('@')[0]);

  // function for submitting form
  const handleSubmit = (event) => {
    const username = usernameRef.current;
    event.preventDefault();
    const text = messageInputRef.current.value;
    if (!text) return;

    displayMessage(username, text);
    socket.emit("new-message", { username, text });
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
    const socket = io("http://localhost:8080");
    const username = usernameRef.current;

    // connect
    socket.on("connect", () => {
      setSocket(socket);
      displayMessage(username, "has connected.");
      socket.emit("new-message", { username, text: "has connected." });

      socket.emit("join", username);
    });

    // receive broadcasted message
    socket.on("receive-message", (data) => {
      displayMessage(data.username, data.text)
    });
    
    // user disconnect notification
    socket.on("user-disconnected", (disconnectedUser) => {
      displayMessage(disconnectedUser, "has disconnected")
    });
 
    return () => {
      socket.disconnect();
    };
  }, [usernameRef]);

  return (
    <>
      <div ref={chatBoxRef} id="chat-box">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <div className="username">{message.name}</div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
      </div>
      <div className="message-form">
        <form onSubmit={handleSubmit}>
          <textarea
            id="message-input"
            ref={messageInputRef}
            placeholder="Message..."
            rows={4}
            cols={30}
            onKeyDown={handleKeyPress}
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  );
}
