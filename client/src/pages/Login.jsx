import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/context";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + (error.response?.data?.message || "Please check your credentials."));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-center font-bold text-gray-800">Welcome Back</h2>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email Address"
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full p-3 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition duration-200">
          Login
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
