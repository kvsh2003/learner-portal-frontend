"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, remember);
      router.push("/my-learning");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("password");
    setError("");
  }

  return (
    <div className="max-w-sm mx-auto my-12">
      <div className="border border-gray-200 rounded p-6 bg-white">
        <h1 className="text-xl font-bold text-black text-center">Login</h1>
        <p className="text-xs text-gray-500 text-center mt-1">
          Sign in to access your courses
        </p>

        {error && (
          <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded text-black cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-xs text-gray-600 cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">Demo accounts:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("amara@example.com")}
              className="flex-1 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-100"
            >
              Amara
            </button>
            <button
              type="button"
              onClick={() => fillDemo("nuwan@example.com")}
              className="flex-1 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-100"
            >
              Nuwan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
