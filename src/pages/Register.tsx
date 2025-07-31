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
    setForm((prev) => ({ ...prev, [name]: value }));
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
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await axios.post(
        "https://circle-app-be-production.up.railway.app/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        title: "Registrasi Berhasil!",
        text: "Apakah kamu ingin lanjut login sekarang?",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#555",
        confirmButtonText: "Ya, Login",
        cancelButtonText: "Nanti aja",
        background: "#1f1f1f",
        color: "#fff",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal register");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-5xl bg-[#1f1f1f] shadow-lg rounded-2xl flex overflow-hidden">
        {/* LEFT SIDE */}
        <div className="w-1/2 bg-[#121212] text-white p-10 flex flex-col justify-center items-center relative">
          <img
            src="/fylo.png"
            alt="Logo"
            className="w-48 h-48 object-contain mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">Fylo App</h1>
          <p className="text-lg text-center">
            Welcome! Join the community and start your journey with Fylo.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="w-1/2 p-10 space-y-5 bg-[#1f1f1f] flex flex-col justify-center"
        >
          <h1 className="text-3xl font-bold text-center mb-4">Register</h1>

          <Input
            name="name"
            placeholder="Nama Lengkap , max.10 character"
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

          <Button type="submit" className="w-full">
            Register
          </Button>

          <p className="text-sm text-center text-gray-400 mt-2">
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
