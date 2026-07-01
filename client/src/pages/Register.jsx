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
      alert(
        "Registration failed: " +
          (error.response?.data?.message || "Please try again."),
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#040404]">
      <form onSubmit={submit} className="premium-card w-full max-w-md p-8">
        <h2 className="text-3xl mb-6 text-center font-bold text-white">
          Create Account
        </h2>

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

        <button className="w-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#e2b84d] p-3 font-semibold text-black transition duration-200 hover:brightness-110">
          Register
        </button>

        <p className="text-center mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-white hover:underline">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
