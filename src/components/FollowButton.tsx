import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { socket } from "@/hooks/socket";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowToggleButtonProps {
  targetUserId: number;
  currentUserId: number;
  showFollowBackOnly?: boolean;
}

const FollowToggleButton: React.FC<FollowToggleButtonProps> = ({
  targetUserId,
  currentUserId,
  showFollowBackOnly = false,
}) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followId, setFollowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const res = await axios.get(
          `https://circle-app-be-production.up.railway.app/auth/following/${currentUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const followingList = res.data;
        const found = followingList.find(
          (item: any) => item.user.id === targetUserId
        );

        if (found) {
          setIsFollowing(true);
          setFollowId(found.id);
        }
      } catch (err) {
        console.error("Gagal cek status follow:", err);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    socket.on("newFollow", (data) => {
      console.log("🔔 Event 'newFollow' diterima:", data);
    });

    socket.on("newUnfollow", (data) => {
      console.log("🔕 Event 'newUnfollow' diterima:", data);
    });

    return () => {
      socket.off("newFollow");
      socket.off("newUnfollow");
    };
  }, []);

  const handleFollow = async () => {
    try {
      const res = await axios.post(
        "https://circle-app-be-production.up.railway.app/auth/add-following",
        {
          userId: currentUserId,
          followId: targetUserId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const followData = res.data.following;
      setIsFollowing(true);
      setFollowId(followData.id);

      Swal.fire("Berhasil!", "Kamu sekarang mengikuti user ini.", "success");

      socket.emit("follow", {
        fromUserId: currentUserId,
        toUserId: targetUserId,
        followId: followData.id,
      });
    } catch (error) {
      console.error("Gagal follow:", error);
      Swal.fire("Gagal", "Tidak dapat mengikuti user ini.", "error");
    }
  };

  const handleUnfollow = async () => {
    if (!followId) return;

    try {
      await axios.delete(
        `https://circle-app-be-production.up.railway.app/auth/unfollow/${followId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsFollowing(false);
      setFollowId(null);

      Swal.fire("Berhasil!", "Berhenti mengikuti user ini.", "info");

      socket.emit("unfollow", {
        fromUserId: currentUserId,
        toUserId: targetUserId,
        unfollowId: followId,
      });
    } catch (error) {
      console.error("Gagal unfollow:", error);
      Swal.fire("Gagal", "Tidak dapat unfollow.", "error");
    }
  };

  // Skeleton saat loading
  if (loading) {
    return <Skeleton className="h-8 w-24 rounded-md" />;
  }

  if (currentUserId === targetUserId) return null;
  if (showFollowBackOnly && isFollowing) return null;

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      className={`px-4 py-1 rounded-md font-semibold text-sm ${
        isFollowing
          ? "bg-red border border-white-100 hover:bg-gray-200 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {isFollowing ? "Unfoll" : showFollowBackOnly ? "FolBack" : "Follow"}
    </button>
  );
};

export default FollowToggleButton;
