import { useBlockNavigationStore } from "@/store/useBlockNavigationStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useNavigate();

  const adminModeToggle = useNavigationStore().toggleAdminMode;
  const blockAdminModeToggle = useBlockNavigationStore().toggleAdminMode;

  const handleAdminToggle = () => {
    adminModeToggle();
    blockAdminModeToggle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("All fields are required");
    }

    const EMAIL = "admin@gmail.com";
    const PASSWORD = "admin@123";

    if (email === EMAIL && password === PASSWORD) {
      router("/");
      handleAdminToggle();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-xl border border-slate-800"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Admin Panel Login
        </h2>

        {error && (
          <div className="mb-4 text-red-400 text-sm text-center">{error}</div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-slate-400">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-3 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="admin@campus.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-slate-400">Password</label>
          <div className="relative mt-1">
            <input
              type={showPass ? "text" : "password"}
              className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-slate-400 text-sm"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
