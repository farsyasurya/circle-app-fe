// PostCard.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineComment } from "react-icons/ai";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import CommentDialog from "@/components/CommentDialog";
import { socket } from "@/hooks/socket";
import { setLikeData, toggleLike } from "@/redux/likeSlice";
import type { RootState } from "@/redux/store";

dayjs.extend(relativeTime);
dayjs.locale("id");

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
  likes: { userId: number }[];
  comments: any[];
}

interface PostCardProps {
  post: Post;
  currentUserId: number | null;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const dispatch = useDispatch();
  const liked = useSelector(
    (state: RootState) => state.likes.likedPosts[post.id]
  );
  const count = useSelector(
    (state: RootState) => state.likes.likeCounts[post.id]
  );

  const [commentCount, setCommentCount] = useState(post.comments.length);

  useEffect(() => {
    if (liked === undefined || count === undefined) {
      const isLiked = post.likes.some((l) => l.userId === currentUserId);
      dispatch(
        setLikeData({
          postId: post.id,
          liked: isLiked,
          count: post.likes.length,
        })
      );
    }
  }, [dispatch, liked, count, post, currentUserId]);

  useEffect(() => {
    const handleNewComment = (data: { postId: number }) => {
      if (data.postId === post.id) setCommentCount((prev) => prev + 1);
    };

    socket.on("new-comment", handleNewComment);
    return () => {
      socket.off("new-comment", handleNewComment);
    };
  }, [post.id]);

  const handleLikeToggle = async () => {
    if (!currentUserId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const likedNow = !liked;

    try {
      if (likedNow) {
        await axios.post(
          `https://circle-app-be-production.up.railway.app/post/${post.id}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(
          `https://circle-app-be-production.up.railway.app/post/${post.id}/unlike`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      socket.emit("new-like", {
        postId: post.id,
        userId: currentUserId,
        action: likedNow ? "like" : "unlike",
      });

      dispatch(toggleLike({ postId: post.id, liked: likedNow }));
    } catch (err) {
      console.error("Gagal mengubah like:", err);
    }
  };

  return (
    <div className="bg-black text-white rounded-xl border border-gray-800 shadow-md overflow-hidden  w-full max-w-md mx-auto">
      {/* Header User */}
      <div className="flex justify-between items-center px-4 pt-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={post.user.name} avatar={post.user.avatar} />
          <div>
            <p className="text-sm font-semibold">{post.user.name}</p>
            <p className="text-xs text-gray-400">
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-3 mb-2" />

      {/* Konten */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-200">{post.content}</p>
        </div>
      )}

      {/* Gambar */}
      {post.image && (
        <div className="relative w-full aspect-video bg-black">
          <img
            src={`https://circle-app-be-production.up.railway.app${post.image}`}
            alt="post"
            className="w-full h-auto max-h-[400px] object-cover"
          />
        </div>
      )}

      {/* Aksi */}
      <div className="flex items-center gap-4 px-4 py-3 text-gray-300 text-sm">
        <LikeButton
          liked={liked ?? false}
          count={count ?? post.likes.length}
          onToggle={handleLikeToggle}
        />
        <CommentDialog
          postId={post.id}
          onNewComment={() => {}}
          trigger={
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <AiOutlineComment size={18} />
              <span>Komentar</span>
            </button>
          }
        />
        <span className="ml-auto text-xs text-gray-500">
          {commentCount} komentar
        </span>
      </div>
    </div>
  );
}

//CLOUD NAME = dwwujmxcm
//API KEY = 615811183229841
//API SECRET = F9vRvKaMxDoN9roFSZzPVNknrWM
//API environment variable = CLOUDINARY_URL=cloudinary://615811183229841:F9vRvKaMxDoN9roFSZzPVNknrWM@dwwujmxcm
