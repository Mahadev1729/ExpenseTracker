import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

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
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "var(--bg-root)" }}
    >
      <form onSubmit={submit} className="premium-card w-full max-w-md p-8 animate-fade-up">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🚀</p>
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-heading)" }}>
            Create Account
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Start tracking your expenses today
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Full Name
            </label>
            <input
              placeholder="John Doe"
              className="premium-input w-full px-4 py-3 text-sm focus:outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="premium-input w-full px-4 py-3 text-sm focus:outline-none"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="premium-input w-full px-4 py-3 text-sm focus:outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 rounded-full bg-gradient-to-r from-[#c9a227] to-[#e2b84d] p-3 font-semibold text-black transition duration-200 hover:brightness-110 shadow-[0_8px_20px_rgba(201,162,39,0.2)]"
        >
          Create Account
        </button>

        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <a href="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
