import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { type UserPreviewData } from "../types/userPreviewData";
import FollowButton from "../components/FollowButton";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenPayload {
  userId: number;
}

interface SuggestedUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export default function UserSidebar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserPreviewData | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

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
        setIsLoadingSidebar(false);
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(
          `https://circle-app-be-production.up.railway.app/auth/suggested-users/${loginUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuggestedUsers(res.data);
      } catch (error) {
        console.error("Gagal", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchUserData();
    fetchSuggestedUsers();
  }, [id]);

  if (isLoadingSidebar) {
    return (
      <aside className="bg-[#1f1f21] text-white rounded-xl overflow-hidden max-w-sm w-full shadow-lg mx-auto animate-pulse p-4 space-y-4">
        <div className="h-24 bg-gradient-to-r from-yellow-400 to-green-300 relative" />
        <div className="w-20 h-20 rounded-full bg-gray-600 border-4 border-[#1f1f21] -mt-10 mx-4" />
        <Skeleton className="w-32 h-5 bg-gray-600 mx-4" />
        <Skeleton className="w-40 h-4 bg-gray-600 mx-4" />
        <div className="flex justify-around mt-4">
          <Skeleton className="w-12 h-4 bg-gray-600" />
          <Skeleton className="w-12 h-4 bg-gray-600" />
        </div>
        <Skeleton className="w-full h-8 bg-gray-600 rounded-full" />
      </aside>
    );
  }

  return (
    <aside className="bg-[#1f1f21] text-white rounded-xl overflow-hidden max-w-sm w-full shadow-lg mx-auto">
      {/* Header Gradient */}
      <div className="h-24 bg-gradient-to-r from-yellow-400 to-green-300 relative">
        <div className="absolute -bottom-10 left-4">
          <img
            src={
              userData?.avatar
                ? `https://circle-app-be-production.up.railway.app${userData.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userData?.name || ""
                  )}`
            }
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-[#1f1f21] object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-12 px-4 text-left space-y-1">
        <h2 className="text-xl font-bold">{userData?.name}</h2>
        <p className="text-sm text-gray-400">{userData?.email}</p>
      </div>

      {/* Follow Stats */}
      <div className="flex justify-around mt-4 px-4 text-center">
        <div>
          <p className="text-white font-semibold">{userData?.followingCount}</p>
          <p className="text-sm text-gray-400">Mengikuti</p>
        </div>
        <div>
          <p className="text-white font-semibold">{userData?.followersCount}</p>
          <p className="text-sm text-gray-400">Pengikut</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 py-4">
        {isOwnProfile ? (
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full text-sm font-semibold transition"
          >
            Detail Profil
          </button>
        ) : (
          <FollowButton
            targetUserId={parseInt(targetId)}
            currentUserId={loginUserId}
          />
        )}
      </div>

      {/* Suggested Users */}
      {(isLoadingSuggestions || suggestedUsers.length > 0) && (
        <div className="px-4 pb-4">
          <h3 className="text-md font-semibold text-gray-200 mb-3">
            Disarankan untuk Anda
          </h3>
          <ul className="space-y-3">
            {isLoadingSuggestions
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-full bg-gray-600" />
                      <div className="space-y-1">
                        <Skeleton className="w-24 h-3 bg-gray-600 rounded" />
                        <Skeleton className="w-32 h-2 bg-gray-700 rounded" />
                      </div>
                    </div>
                    <Skeleton className="w-16 h-6 bg-gray-600 rounded-full" />
                  </li>
                ))
              : suggestedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.avatar
                            ? `https://circle-app-be-production.up.railway.app${user.avatar}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}`
                        }
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="text-sm">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <FollowButton
                      targetUserId={user.id}
                      currentUserId={loginUserId}
                    />
                  </li>
                ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
