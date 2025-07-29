import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "@/hooks/socket";
import PostCard from "@/components/PostCard";
import { useDispatch } from "react-redux";
import { toggleLike } from "@/redux/likeSlice";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const dispatch = useDispatch();

  // 🔁 Merge posts without duplicates
  const mergePosts = (existing: Post[], incoming: Post[]): Post[] => {
    const map = new Map<number, Post>();
    [...incoming, ...existing].forEach((post) => {
      map.set(post.id, post);
    });
    return Array.from(map.values());
  };

  // 🔁 Fetch posts with pagination
  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://circle-app-be-production.up.railway.app/post?page=${page}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => mergePosts(prev, data));
        setPage((prev) => prev + 1);
      }

      if (token && currentUserId === null) {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(tokenPayload.userId);
      }
    } catch (err) {
      console.error("Gagal mengambil postingan:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // ⏳ Initial fetch + scroll listener
  useEffect(() => {
    fetchPosts();

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !loading
      ) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  // ❤️ Listen for like/unlike event
  useEffect(() => {
    const handleLikeEvent = (data: {
      postId: number;
      userId: number;
      action: "like" | "unlike";
    }) => {
      dispatch(
        toggleLike({
          postId: data.postId,
          liked: data.action === "like",
        })
      );
    };

    socket.on("new-like", handleLikeEvent);
    return () => {
      socket.off("new-like", handleLikeEvent);
    };
  }, [dispatch]);

  // 🆕 Listen for newPost socket event
  useEffect(() => {
    const handleNewPost = (newPost: Post) => {
      setPosts((prev) => mergePosts(prev, [newPost]));
    };

    socket.on("newPost", handleNewPost);
    return () => {
      socket.off("newPost", handleNewPost);
    };
  }, []);

  // 🔄 Skeleton loader
  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="p-4 border border-gray-700 rounded-xl space-y-3 animate-pulse"
      >
        <div className="flex items-center space-x-4">
          <Skeleton className="w-10 h-10 rounded-full bg-gray-600" />
          <Skeleton className="w-32 h-4 bg-gray-600 rounded" />
        </div>
        <Skeleton className="w-full h-4 bg-gray-600 rounded" />
        <Skeleton className="w-full h-52 bg-gray-600 rounded" />
      </div>
    ));
  };

  return (
    <div className="p-4 space-y-4">
      {initialLoading ? (
        renderSkeletons()
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))
      ) : (
        <p className="text-gray-400 text-center">Belum ada postingan</p>
      )}

      {loading && !initialLoading && (
        <p className="text-center text-gray-400 mt-4">Loading...</p>
      )}

      {!hasMore && !initialLoading && posts.length > 0 && (
        <p className="text-center text-gray-500 mt-4">
          Tidak ada lagi postingan.
        </p>
      )}
    </div>
  );
}
