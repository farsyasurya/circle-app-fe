import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

interface Props {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

export default function LikeButton({ liked, count, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 ${
        liked ? "text-red-500" : "text-gray-300"
      }`}
    >
      {liked ? <AiFillHeart size={16} /> : <AiOutlineHeart size={16} />}
      <span>{count}</span>
    </button>
  );
}
