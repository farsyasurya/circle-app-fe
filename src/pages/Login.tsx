import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://circle-app-be-production.up.railway.app/auth/login",
        form,
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-800 px-4 text-gray-200">
      <div className="flex flex-col-reverse md:flex-row w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl border border-gray-700">
        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 w-full md:w-1/2 p-6 sm:p-10 space-y-6"
        >
          <h2 className="text-3xl font-bold text-center text-white">
            Selamat Datang
          </h2>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="space-y-4">
            <Input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
          >
            Masuk
          </Button>

          <p className="text-sm text-center text-gray-400">
            Belum punya akun?{" "}
            <a
              href="https://far-circle.netlify.app/register"
              className="text-blue-400 hover:text-blue-500 hover:underline transition duration-200"
            >
              Daftar sekarang
            </a>
          </p>
        </form>

        {/* Brand & Illustration */}
        <div className="bg-gray-900 w-full md:w-1/2 flex flex-col items-center justify-center p-10">
          <h1 className="text-4xl font-bold text-white mb-6">Fylo App</h1>
          <img
            src="/fylo.png"
            alt="Fylo Illustration"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-xl"
          />
        </div>
        <p className="text-lg text-center text-blue-700 mt-8">
          © 2025 Muhammad Farsya Surya. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
