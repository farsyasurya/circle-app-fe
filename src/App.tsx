import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { socket } from "./hooks/socket";
import { jwtDecode } from "jwt-decode";

import MainLayout from "./pages/MainLayout";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Profile from "./pages/Profile";
import SearchUser from "./pages/Search";
import Swal from "sweetalert2";

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const userId = decoded?.userId;
      if (userId) {
        socket.connect();
        socket.emit("join", userId); // masuk ke room user sendiri

        // Dengarkan notifikasi follow
        socket.on("followNotification", ({ fromUserName, message }) => {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: message,
            text: `${fromUserName} mulai mengikuti kamu.`,
            showConfirmButton: false,
            timer: 10000,
          });
        });

        // Dengarkan notifikasi post baru
        socket.on("newPost", (newPost) => {
          const isOwnPost = newPost.user.id === userId;
          Swal.fire({
            toast: true,
            icon: "info",
            position: "top-end",
            title: isOwnPost
              ? "Anda mengunggah postingan baru"
              : `Postingan baru dari ${newPost.user.name}`,
            text: newPost.content,
            showConfirmButton: false,
            timer: 5000,
          });
        });
      }
    } catch (err) {
      console.error("Invalid token:", err);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/search" element={<SearchUser />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
