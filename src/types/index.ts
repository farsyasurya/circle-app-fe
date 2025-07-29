// src/types/index.ts

// Interface untuk objek User seperti yang muncul di dalam Post
// (Hanya properti yang dikembalikan oleh API saat ini)
export interface UserInPost {
  id: number;
  name: string;
  avatar?: string | null; // Avatar bisa null atau string
}

// Interface untuk model User secara penuh (jika Anda mengambil data user secara terpisah)
// Ini mencakup properti yang ada di skema Prisma tetapi mungkin tidak selalu di-populate
export interface FullUser {
  id: number;
  name: string;
  email: string; // Dari skema Prisma, mungkin tidak selalu di-populate ke frontend
  password?: string; // Dari skema Prisma, tidak akan dikirim ke frontend
  avatar?: string | null;
  createdAt: string;
  // posts?: Post[]; // Hubungan, biasanya tidak di-populate penuh untuk menghindari loop
  // comments?: Comment[];
  // likes?: Like[];
}

// Interface untuk model Post
export interface Post {
  id: number;
  content: string;
  image?: string | null; // Gambar bisa null atau string
  user: UserInPost; // Postingan memiliki objek UserInPost (sesuai respons API Anda)
  userId: number; // userId juga ada di root Post
  comments: Comment[]; // Array komentar yang terkait dengan postingan (saat ini kosong di respons Anda)
  likes: Like[] ; // Array like yang terkait dengan postingan (saat ini kosong/ada 1 di respons Anda)
  createdAt: string;
  deletedAt?: string | null; // deletedAt bisa null atau string
}

// Interface untuk model Comment
// Sesuai skema Prisma, dan apa yang diharapkan jika di-populate
export interface Comment {
  id: number;
  content: string;
  userId: number;
  postId: number;
  createdAt: string;
  // Jika API me-populate user/post di dalam comment, tambahkan ini:
  // user?: UserInPost;
  // post?: Post; // Hati-hati dengan circular dependency jika post di-populate penuh
}

// Interface untuk model Like
// Sesuai skema Prisma, dan apa yang diharapkan jika di-populate
export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  user?: UserInPost;
  post?: Post;
}

export interface Followers {
  id: number;
  userId: number;
  flag: number;
  createdAt: string;
}