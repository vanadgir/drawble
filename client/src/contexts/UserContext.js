import { useContext, createContext, useState, useEffect, useCallback } from "react";

// define variables of context
export const UserContext = createContext({
  email: "",
  username: "",
  setEmail: () => {},
  setUsername: () => {}
});

// define provider
export function UserProvider({ children }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  return (
    <UserContext.Provider value={{email, username, setEmail, setUsername}}>
      {children}
    </UserContext.Provider>
  )
}

// verify context exists when used
export function useUser() {
  if (!UserContext) {
    throw new Error("UserContext must be defined");
  }
  return useContext(UserContext);
}