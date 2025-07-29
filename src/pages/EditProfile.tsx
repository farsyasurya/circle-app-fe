import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { useState } from "react";
import axios from "axios";
import type { UserPreviewData } from "../types/userPreviewData";

function EditProfileDialog({ user }: { user: UserPreviewData }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (avatar) formData.append("avatar", avatar);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "https://circle-app-be-production.up.railway.app/auth/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire("Berhasil!", "Profil berhasil diupdate.", "success").then(
        () => {
          window.location.reload(); // atau panggil refetch jika pakai SWR
        }
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal update profil", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700">
          ✏️ Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1f1f21] text-white max-w-md">
        <h2 className="text-lg font-bold mb-4">Edit Profil</h2>
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            placeholder="Nama"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full p-2 text-sm text-gray-300"
          />
          <button
            onClick={handleUpdate}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 rounded py-2"
          >
            Simpan Perubahan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { EditProfileDialog };
