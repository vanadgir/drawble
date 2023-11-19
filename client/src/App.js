import { useState, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import "./App.css";

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const url = "http://localhost:8080";

  const handleLogin = () => {
    window.location.href = `${url}/auth/google`;
  };

  const handleLogout = () => {
    setIsVerified(false);
    window.location.href = `${url}/logout`;
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${url}/auth/status`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsVerified(data.authenticated);
          if (data.authenticated) {
            setUserEmail(data.email);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsVerified(false);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <div className="main">
      <h1>drawble</h1>
      {isVerified ? (
        <>
          <ChatBox userEmail={userEmail}/>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}
