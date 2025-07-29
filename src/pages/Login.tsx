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
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-800 text-gray-200">
      <div className="flex flex-col md:flex-row items-center md:items-stretch max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Left: Brand and image */}
        <div className="bg-gray-900 flex flex-col justify-center items-center p-8 md:w-1/2">
          <h1 className="text-4xl font-bold text-white mb-4">Fylo App</h1>
          <img
            src="/fylo.png"
            alt="Fylo Illustration"
            className="w-40 h-40 object-contain"
          />
        </div>

        {/* Right: Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 md:w-1/2 w-full space-y-6"
        >
          <h2 className="text-3xl font-semibold text-center text-gray-50">
            Login
          </h2>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <Button type="submit" className="w-full">
            Masuk
          </Button>

          <p className="text-sm text-center text-gray-400">
            Belum punya akun?{" "}
            <a
              className="text-blue"
              href="https://far-circle.netlify.app/register"
            >
              daftar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
