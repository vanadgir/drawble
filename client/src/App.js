import { useState, useEffect } from "react";
import RoomMenu from "./components/RoomMenu";
import "./App.css";

export default function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState('');
  const url = "http://localhost:8080";

  // login redirect
  const handleLogin = () => {
    window.location.href = `${url}/auth/google`;
  };

  // logout redirect
  const handleLogout = () => {
    setIsVerified(false);
    window.location.href = `${url}/logout`;
  };

  // checking auth status
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
            const name = data.email.split("@")[0];
            setUsername(name);
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
        <div className="game-container">
          <RoomMenu username={username}/>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}
