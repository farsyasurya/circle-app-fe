import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FollowToggleButton from "../components/FollowButton";
import { Link } from "react-router-dom";

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
      <Card key={user.id} className="bg-[#111113]   text-white">
        <CardContent className="flex items-center justify-between gap-4 py-2 px-1">
          <div className="flex items-center gap-4">
            <img
              src={avatarSrc}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover "
            />
            <div>
              <p className="font-semibold">
                <Link
                  to={`/profile/${user.id}`}
                  className="text-sm font-semibold text-blue-400 hover:underline"
                >
                  {user.name}
                </Link>
              </p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          {currentUserId && currentUserId !== user.id && (
            <FollowToggleButton
              targetUserId={user.id}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-xl font-semibold text-blue-400 mb-4">Cari User</h1>

      <Input
        placeholder="Cari berdasarkan nama..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-[#1f1f21] border  text-white mb-6"
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
