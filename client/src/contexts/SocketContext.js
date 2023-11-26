import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

// helper function for string gen
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

// define variables of context
export const SocketContext = createContext({
  socket: null,
  roomKey: null,
  createRoom: () => {},
  joinRoom: () => {},
  leaveRoom: () => {}
});

// define provider
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [roomKey, setRoomKey] = useState(null);

  // start socket connection on component load
  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // create room function
  const createRoom = useCallback((username) => {
    if (socket) {
      const room = generateRandomString(12);
      socket.emit("join-room", {username, roomKey: room});
      setRoomKey(room);
    }
  }, [socket]);

  // join room function
  const joinRoom = useCallback(({username, room}) => {
    if (socket) {
      socket.emit("check-rooms", room, (isRoomExists) => {
        if (isRoomExists) {
          setRoomKey(room);
          socket.emit("join-room", {username, roomKey: room});
        } else {
          alert("Room does not exist.");
        }
      });
    }
  }, [socket]);

  // leave room function
  const leaveRoom = useCallback(({room}) => {
    if (socket) {
      socket.emit("leave-room", {roomKey: room});
      setRoomKey(null);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{socket, roomKey, createRoom, joinRoom, leaveRoom}}>
      {children}
    </SocketContext.Provider>
  )
}

// verify context exists when used
export function useSocket() {
  if (!SocketContext) {
    throw new Error("SocketContext must be defined");
  }
  return useContext(SocketContext);
}