import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { type UserPreviewData } from "../types/userPreviewData";
import UserPreviewCard from "@/components/UserPreviewCard";

interface TokenPayload {
  userId: number;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<UserPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  if (!token) return <div className="text-white p-8">Unauthorized</div>;

  const decoded = jwtDecode<TokenPayload>(token);
  const loginUserId = decoded.userId;

  const targetId = id || loginUserId.toString();
  const isOwnProfile = !id || parseInt(id) === loginUserId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, followRes, postsRes] = await Promise.all([
          axios.get(
            `https://circle-app-be-production.up.railway.app/auth/user/${targetId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `https://circle-app-be-production.up.railway.app/auth/count-follow/${targetId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `https://circle-app-be-production.up.railway.app/post/${targetId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const merged: UserPreviewData = {
          ...userRes.data,
          followersCount: followRes.data.totalFollowers,
          followingCount: followRes.data.totalFollowing,
          posts: postsRes.data,
        };

        setUserData(merged);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-700 rounded w-1/3" />
            </div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-1/4 mt-2" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="h-40 bg-gray-700 rounded" />
            <div className="h-40 bg-gray-700 rounded" />
            <div className="h-40 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData)
    return <div className="text-white p-8">Data tidak ditemukan</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-100">
      <UserPreviewCard user={userData} showPosts isOwnProfile={isOwnProfile} />
    </div>
  );
}
