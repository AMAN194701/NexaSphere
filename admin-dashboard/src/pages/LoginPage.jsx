import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/auth";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const data = await adminLogin(email, password);

      // Save JWT token
      localStorage.setItem("token", data.token);

      alert("Login Successful");

      navigate("/admin");

    } catch (error) {

      alert(error.message);

    }
  };

  return (
    <div className="login-container">

      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}