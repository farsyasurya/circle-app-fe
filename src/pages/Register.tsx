import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.slice(0, name === "name" ? 10 : undefined),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (avatar) formData.append("avatar", avatar);

      await axios.post(
        "https://circle-app-be-production.up.railway.app/auth/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        title: "Registrasi Berhasil!",
        text: "Apakah kamu ingin login sekarang?",
        icon: "success",
        background: "#1f1f1f",
        color: "#fff",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#555",
        confirmButtonText: "Ya, Login",
        cancelButtonText: "Nanti aja",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden bg-[#1f1f1f] rounded-2xl shadow-xl border border-gray-700">
        {/* Left Side - Branding */}
        <div className="w-full md:w-1/2 bg-[#121212] flex flex-col justify-center items-center p-10">
          <img
            src="/fylo.png"
            alt="Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-6"
          />
          <h1 className="text-3xl font-bold mb-2">Fylo App</h1>
          <p className="text-center text-gray-400 text-base sm:text-lg">
            Welcome! Join the community and start your journey with Fylo.
          </p>
        </div>

        {/* Right Side - Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="w-full md:w-1/2 p-8 sm:p-10 bg-[#1f1f1f] flex flex-col justify-center space-y-5"
        >
          <h2 className="text-3xl font-bold text-center">Register</h2>

          <Input
            name="name"
            placeholder="Nama Lengkap (max. 10 karakter)"
            value={form.name}
            onChange={handleChange}
            className="bg-[#2a2a2a] text-white"
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-[#2a2a2a] text-white"
          />
          <Input
            name="password"
            type="password"
            placeholder="Buat password anda..."
            value={form.password}
            onChange={handleChange}
            className="bg-[#2a2a2a] text-white"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="bg-[#2a2a2a] text-white file:text-white"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
          >
            Register
          </Button>

          <p className="text-sm text-center text-gray-400">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
