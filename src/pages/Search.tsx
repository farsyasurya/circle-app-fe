import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FollowToggleButton from "../components/FollowButton";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export default function SearchUser() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserId = token ? getUserIdFromToken(token) : null;

  useEffect(() => {
    fetchUsers(); // initial fetch
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(query);
    }, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const fetchUsers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://circle-app-be-production.up.railway.app/auth/search?name=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal mencari user:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = (user: User) => {
    const avatarSrc = user.avatar
      ? `https://circle-app-be-production.up.railway.app${user.avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;

    return (
      <Card
        key={user.id}
        className="bg-[#111113] border border-gray-700 text-white"
      >
        <CardContent className="flex flex-nowrap items-center justify-between gap-4 py-4 px-4 sm:px-6">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={avatarSrc}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
            </div>
          </div>

          {currentUserId && currentUserId !== user.id && (
            <div className="ml-auto">
              <FollowToggleButton
                targetUserId={user.id}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-screen-md mx-auto text-white min-h-screen">
      <h1 className="text-lg sm:text-xl font-semibold text-blue-400 mb-4">
        Cari User
      </h1>

      <Input
        placeholder="Cari berdasarkan nama..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-[#1f1f21] border border-gray-700 text-white mb-6"
      />

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-800" />
          ))
        ) : users.length === 0 ? (
          <p className="text-gray-500">Tidak ditemukan</p>
        ) : (
          users.map(renderUserCard)
        )}
      </div>
    </div>
  );
}
