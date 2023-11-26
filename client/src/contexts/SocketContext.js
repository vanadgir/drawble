import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

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

export const SocketContext = createContext({
  socket: null,
  roomKey: null,
  createRoom: () => {},
  joinRoom: () => {},
  leaveRoom: () => {}
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [roomKey, setRoomKey] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const createRoom = useCallback(() => {
    if (socket) {
      const room = generateRandomString(12);
      socket.emit("create-room", {room});
      setRoomKey(room);
    }
  }, [socket]);

  const joinRoom = useCallback(({room}) => {
    if (socket) {
      socket.emit("join-room", {room});
      setRoomKey(room);
    }
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit("leave-room");
      setRoomKey(null);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{socket, roomKey, createRoom, joinRoom, leaveRoom}}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  if (!SocketContext) {
    throw new Error("SocketContext must be defined");
  }
  return useContext(SocketContext);
}