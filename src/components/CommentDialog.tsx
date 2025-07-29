import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { socket } from "@/hooks/socket";

interface CommentDialogProps {
  postId: number;
  trigger: React.ReactNode;
  onNewComment: (postId: number) => void;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string | null;
  };
  postId?: number;
}

interface PostDetail {
  id: number;
  content: string;
  image: string | null;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
  likes: any[];
  comments: any[];
}

export default function CommentDialog({
  postId,
  trigger,
  onNewComment,
}: CommentDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchPostAndComments = async () => {
      try {
        const [commentRes, postRes] = await Promise.all([
          axios.get(
            `https://circle-app-be-production.up.railway.app/comments/${postId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `https://circle-app-be-production.up.railway.app/post/post-by-postId/${postId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setComments(commentRes.data);
        setPost(postRes.data);
      } catch (err) {
        console.error("❌ Gagal memuat komentar atau post:", err);
      }
    };

    fetchPostAndComments();

    // WebSocket listener
    const handleReceiveComment = (data: Comment) => {
      if (Number(data.postId) === Number(postId)) {
        const safeComment = {
          ...data,
          user: data.user || { name: "Anonim", avatar: null },
        };
        setComments((prev) => [...prev, safeComment]);
      }
    };

    socket.on("receive-comment", handleReceiveComment);

    return () => {
      socket.off("receive-comment", handleReceiveComment);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) return;

    const user = JSON.parse(userData);

    try {
      const res = await axios.post(
        `https://circle-app-be-production.up.railway.app/comments`,
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const localComment: Comment = {
        id: res.data.id,
        content: newComment,
        createdAt: new Date().toISOString(),
        user: { name: user.name, avatar: user.avatar || null },
        postId,
      };

      socket.emit("new-comment", localComment); // real-time
      setNewComment(""); // reset form
      onNewComment(postId); // callback
    } catch (err) {
      console.error("❌ Gagal mengirim komentar:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white">
        {post && (
          <div className="mb-4 p-4 rounded bg-gray-800 shadow">
            <div className="flex items-center gap-3 mb-2">
              {post.user.avatar && (
                <img
                  src={`https://circle-app-be-production.up.railway.app${post.user.avatar}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-semibold">{post.user.name}</span>
            </div>
            <p className="text-sm mb-2">{post.content}</p>
            {post.image && (
              <img
                src={`https://circle-app-be-production.up.railway.app${post.image}`}
                alt="post"
                className="w-full max-h-60 rounded object-cover mb-2"
              />
            )}
            <div className="text-xs text-gray-400 flex gap-4 mt-2">
              <span>
                🗓️{" "}
                {new Date(post.createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>❤️ {post.likes?.length ?? 0} likes</span>
              <span>💬 {post.comments?.length ?? 0} comments</span>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-2">Komentar</h2>
        <div className="space-y-3 mb-4">
          {comments.length === 0 && (
            <p className="text-gray-400">Belum ada komentar.</p>
          )}
          {comments.map((comment, index) => (
            <div
              key={comment.id ?? index}
              className="bg-gray-800 p-3 rounded-md"
            >
              <div className="flex items-center gap-2 mb-1">
                {comment.user?.avatar && (
                  <img
                    src={`https://circle-app-be-production.up.railway.app${comment.user.avatar}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <p className="text-sm font-semibold">
                  {comment.user?.name ?? "Anonim"}
                </p>
                <p className="text-xs text-gray-400 ml-auto">
                  {new Date(comment.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            placeholder="Tulis komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          >
            Kirim
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
