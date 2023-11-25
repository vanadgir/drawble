import { useState, useEffect } from "react";
import ViewController from "./components/ViewController";
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
        <>
          <ViewController username={username}/> 
          <button id="logout" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button id="login" onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}
