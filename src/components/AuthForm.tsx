import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = type === "login" ? "/login" : "/register";

    const res = await fetch(
      `https://circle-app-be-production.up.railway.app${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert(`${type} berhasil!`);
      navigate("/products");
    } else {
      alert(data.message || "Gagal");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 p-8 rounded-3xl shadow-2xl space-y-7 bg-zinc-900 border border-zinc-700 transform transition-all duration-500 hover:shadow-zinc-700/50"
    >
      <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        {type === "login" ? "Welcome Back!" : "Join Us Today!"}
      </h1>

      {type === "register" && (
        <>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-semibold text-zinc-200"
            >
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Your Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-50 border border-zinc-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div>
            <label
              htmlFor="profilePicture"
              className="block mb-2 text-sm font-semibold text-zinc-200"
            >
              Profile Picture
            </label>
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-semibold text-zinc-200"
        >
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-50 border border-zinc-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-semibold text-zinc-200"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-50 border border-zinc-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
        />
      </div>

      <Button
        type="submit"
        className="w-full mt-6 py-3 rounded-lg text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
      >
        {type === "login" ? "Sign In" : "Register Account"}
      </Button>

      <p className="text-sm text-center text-zinc-400 mt-6">
        {type === "login" ? (
          <>
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-500 hover:underline font-medium transition-colors duration-200"
            >
              Sign Up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-500 hover:underline font-medium transition-colors duration-200"
            >
              Login Here
            </a>
          </>
        )}
      </p>
    </form>
  );
}
