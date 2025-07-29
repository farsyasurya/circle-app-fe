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

export interface UserPreviewData {
  id: number;
  name: string;
  email?: string;
  avatar?: string | null;
  followersCount?: number;
  followingCount?: number;
  posts?: Post[];
}
