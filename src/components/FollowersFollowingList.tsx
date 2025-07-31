import React, { useEffect, useState } from "react";
import axios from "axios";
import FollowToggleButton from "./FollowButton";

interface FollowData {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

interface Props {
  userId: number;
  activeTab: "followers" | "following";
}

function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

const FollowersFollowingList: React.FC<Props> = ({ userId, activeTab }) => {
  const [followers, setFollowers] = useState<FollowData[]>([]);
  const [following, setFollowing] = useState<FollowData[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const currentUserId = token ? getUserIdFromToken(token) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [followersRes, followingRes] = await Promise.all([
          axios.get(
            `https://circle-app-be-production.up.railway.app/auth/followers/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://circle-app-be-production.up.railway.app/auth/following/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
      } catch (error) {
        console.error("Gagal mengambil data followers/following:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const renderUserCard = (data: FollowData) => (
    <div
      key={data.user.id}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".follow-button")) return;
        window.location.href = `/profile/${data.user.id}`;
      }}
      className="cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 p-3 bg-[#1f1f21] border border-gray-700 rounded-lg hover:bg-[#2a2a2d] transition">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              data.user.avatar
                ? `https://circle-app-be-production.up.railway.app${data.user.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    data.user.name
                  )}`
            }
            alt={data.user.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <span className="text-white font-medium text-sm sm:text-base truncate">
            {data.user.name}
          </span>
        </div>

        {data.user.id !== currentUserId && (
          <div className="follow-button shrink-0">
            <FollowToggleButton
              targetUserId={data.user.id}
              currentUserId={currentUserId!}
              showFollowBackOnly={
                activeTab === "followers" && currentUserId === userId
              }
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 p-3 bg-[#1f1f21] border border-gray-700 rounded-lg animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full" />
            <div className="w-24 h-4 bg-gray-700 rounded" />
          </div>
          <div className="w-16 h-6 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) return renderSkeleton();

    const list = activeTab === "followers" ? followers : following;

    if (list.length === 0) {
      return (
        <p className="text-center text-gray-400 text-sm">
          {activeTab === "followers"
            ? "Belum ada pengikut."
            : "Belum mengikuti siapa pun."}
        </p>
      );
    }

    return <div className="space-y-3">{list.map(renderUserCard)}</div>;
  };

  return (
    <div className="bg-[#121212] p-4 rounded-xl border border-gray-800 max-w-md w-full mx-auto">
      {renderContent()}
    </div>
  );
};

export default FollowersFollowingList;
