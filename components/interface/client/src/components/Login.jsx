import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.scss";

export default function Login() {
  const [error, setError] = useState("");
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError("");
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Multi-Agent SDE</h2>
        {error && <div className="error-alert">{error}</div>}
        <button onClick={handleGoogleLogin} className="google-btn">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
