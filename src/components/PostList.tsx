import { AnimatePresence, motion } from "framer-motion";
import PostCard from "./PostCard";

interface Props {
  posts: any[];
  currentUserId: number | null;
  onLikeToggle: (postId: number) => void;
}

export default function PostList({ posts, currentUserId }: Props) {
  return (
    <AnimatePresence>
      {posts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-1"
        >
          <PostCard post={post} currentUserId={currentUserId} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
