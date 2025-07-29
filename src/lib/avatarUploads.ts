import { supabase } from "../lib/supabase";

export async function uploadAvatar(
  file: File,
  userId: number
): Promise<string> {
  const filePath = `user_${userId}/${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from("avatar") // ⬅️ pastikan nama bucket kamu "avatars"
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data.publicUrl;
}
