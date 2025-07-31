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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="bg-black text-white min-h-screen">
      {/* Sidebar Kiri */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#0d0d0d] border-r border-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:block`}
      >
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-6 flex items-center">
          <img src="/fylo.png" alt="Logo" className="w-10 h-10 mr-3" />
          <h1 className="text-2xl font-bold text-blue-400">Fylo</h1>
        </div>

        <nav className="flex flex-col space-y-2 px-4">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🏠 <span>Home</span>
          </Link>
          <Link
            to="/search"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🔍 <span>Search</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
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
            className="mt-4 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Tombol buka sidebar di mobile */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white text-3xl ml-4"
        >
          ☰
        </button>
      </div>

      {/* Main dan Sidebar Kanan */}
      <div className="lg:pl-[250px] lg:pr-[320px]">
        {/* Main content */}
        <main className="px-4 pt-20 pb-24 sm:px-6 sm:pt-24 lg:pt-10 lg:pb-10">
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

      {/* Sidebar kanan */}
      <aside className="hidden lg:block fixed top-0 right-0 w-[320px] h-screen overflow-y-auto bg-neutral-900 px-4 py-6 border-l border-gray-800">
        <UserSidebar />
      </aside>
    </div>
  );
}
