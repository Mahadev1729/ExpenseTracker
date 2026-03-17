import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + (error.response?.data?.message || "Please try again."));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl mb-6 text-center font-bold text-gray-800">Create Account</h2>

        <div className="mb-4">
          <input
            placeholder="Full Name"
            className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
          Register
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login here</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
