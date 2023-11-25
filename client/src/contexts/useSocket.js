import { useContext, createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext({
  socket: null
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{socket: socket}}>
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