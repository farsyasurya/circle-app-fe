import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import AddPostDialog from "../components/addPost";
import axios from "axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import UserSidebar from "@/components/UserProfileSidebar";

interface Post {
  id: number;
  content: string;
  image?: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  comments: any[];
  likes: { userId: number }[];
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [, setSelectedPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, [navigate]);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "https://circle-app-be-production.up.railway.app/post/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Gagal ambil data post:", err);
    }
  };

  useEffect(() => {
    const socket = io("https://circle-app-be-production.up.railway.app");

    socket.on("newPost", (newPost: Post) => {
      setPosts((prev) => {
        const exists = prev.some((post) => post.id === newPost.id);
        if (exists) return prev;
        return [newPost, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCommentClick = (postId: number) => {
    setSelectedPostId(postId);
  };

  const updatePostCommentCount = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, {} as any] }
          : post
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-black text-white relative pl-64">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-screen bg-[#0d0d0d] p-6 border-r border-gray-800 shadow-lg z-30 overflow-y-auto">
        <div className="flex items-center mb-6 px-2">
          <img src="/fylo.png" alt="Logo" className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-extrabold text-blue-400">Fylo</h1>
        </div>

        <nav className="space-y-3">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition"
          >
            🏠 <span>Home</span>
          </Link>
          <Link
            to="/search"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition"
          >
            🔍 <span>Search</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#1a1a1a] transition"
          >
            👤 <span>Profile</span>
          </Link>

          <AddPostDialog />

          <button
            onClick={() => {
              Swal.fire({
                title: "Yakin ingin logout?",
                text: "Kamu akan keluar dari akun ini.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Ya, logout",
                cancelButtonText: "Batal",
              }).then((result) => {
                if (result.isConfirmed) {
                  localStorage.clear();
                  window.location.href = "/login";
                }
              });
            }}
            className="mt-4 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full transition-colors shadow"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 overflow-hidden">
        <main className="p-8 h-screen overflow-y-auto">
          <Outlet
            context={{
              handleCommentClick,
              posts,
              setPosts,
              updatePostCommentCount,
            }}
          />
        </main>
      </div>

      <UserSidebar />
    </div>
  );
}
