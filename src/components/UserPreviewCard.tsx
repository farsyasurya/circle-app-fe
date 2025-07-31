import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { EditProfileDialog } from "@/pages/EditProfile";
import FollowersFollowingList from "./FollowersFollowingList";
import type { UserPreviewData } from "@/types/userPreviewData";
import PostCard from "./PostCard";
import type { RootState } from "@/redux/store";
import FollowButton from "./FollowButton";

const TABS = ["posts", "followers", "following"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  user: UserPreviewData;
  showPosts?: boolean;
  isOwnProfile?: boolean;
}

export default function UserPreviewCard({ user, isOwnProfile = false }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id || null
  );

  const renderAvatar = () => (
    <img
      src={
        user.avatar
          ? `https://circle-app-be-production.up.railway.app${user.avatar}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
      }
      alt={user.name}
      className="w-16 h-16 rounded-full object-cover border"
    />
  );

  const renderStats = () => (
    <div className="flex justify-between text-sm text-gray-400 mb-3">
      <span>👥 {user.followersCount ?? 0} Pengikut</span>
      <span>🧭 {user.followingCount ?? 0} Mengikuti</span>
      <span>📝 {user.posts?.length ?? 0} Post</span>
    </div>
  );

  const renderTabs = () => (
    <div className="flex justify-around border-b border-gray-600 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 text-sm font-semibold transition-colors duration-150 ${
            activeTab === tab
              ? "border-b-2 border-blue-400 text-blue-300"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab === "posts"
            ? "Postingan"
            : tab === "followers"
            ? "Pengikut"
            : "Mengikuti"}
        </button>
      ))}
    </div>
  );

  const renderPosts = () => {
    if (!Array.isArray(user.posts) || user.posts.length === 0) {
      return <p className="text-sm text-gray-400">Belum ada postingan.</p>;
    }

    return (
      <div className="space-y-3">
        {user.posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#1f1f21] border border-gray-700 rounded-xl px-4 py-3"
          >
            <PostCard post={post} currentUserId={currentUserId} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#1f1f21] border border-gray-700 rounded-2xl px-5 py-6 text-white w-full max-w-2xl mx-auto">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        {renderAvatar()}
        <div className="flex-1">
          <Link
            to={`/profile/${user.id}`}
            className="text-lg font-semibold text-blue-400 hover:underline"
          >
            {user.name}
          </Link>
          {user.email && <p className="text-sm text-gray-400">{user.email}</p>}
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Edit Button */}
      {isOwnProfile && (
        <div className="mb-4">
          <EditProfileDialog user={user} />
        </div>
      )}

      {!isOwnProfile && currentUserId !== null && (
        <FollowButton targetUserId={user.id} currentUserId={currentUserId} />
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      <div className="mt-4">
        {activeTab === "posts" ? (
          renderPosts()
        ) : (
          <FollowersFollowingList userId={user.id} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}
