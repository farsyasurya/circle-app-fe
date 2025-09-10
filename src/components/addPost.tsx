import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FiImage, FiSend } from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";
const socket = io("https://circle-app-be-production.up.railway.app");

export default function AddPostDialog() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Silakan login dulu");

    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("posts", image);
    }

    try {
      const response = await axios.post(
        "https://circle-app-be-production.up.railway.app/post/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const createdPost = response.data.post;
      socket.emit("newPost", createdPost);

      setContent("");
      setImage(null);
      setOpen(false);
    } catch (err) {
      console.error("Gagal membuat post:", err);
      alert("Gagal membuat post.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full block px-3 py-2 rounded-lg bg-blue-600 text-white text-center hover:bg-blue-700 transition">
          ＋ Tambah Postingan
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-gray-900 border border-gray-700 text-gray-100 rounded-xl">
        <h2 className="text-lg font-bold mb-3">Buat Postingan</h2>

        <Textarea
          placeholder="Tulis sesuatu..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-3 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
        />

        <div className="flex justify-between items-center">
          <label className="cursor-pointer flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
            <FiImage size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {image && (
              <span className="text-xs truncate max-w-[150px] text-gray-400">
                {image.name.length > 20
                  ? image.name.slice(0, 20) + "..."
                  : image.name}
              </span>
            )}
          </label>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full flex items-center gap-2 transition"
          >
            <FiSend size={16} />
            Kirim
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
