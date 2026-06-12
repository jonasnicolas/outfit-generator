import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is optional: it powers uploading your own clothes and cloud caching
// of generated outfits. When it isn't configured, the app still runs with the
// built-in outfits — we just disable the cloud features instead of crashing.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Outfit98] Supabase is not configured (missing VITE_SUPABASE_URL / " +
      "VITE_SUPABASE_ANON_KEY). Uploading and cloud caching are disabled; " +
      "the built-in outfits will still work."
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

// Thrown by write operations that genuinely require a configured backend.
const NOT_CONFIGURED_MESSAGE =
  "Supabase is not configured. Add VITE_SUPABASE_URL and " +
  "VITE_SUPABASE_ANON_KEY to your .env to enable uploads.";

// Database types
export interface ClothingItem {
  id: string;
  name: string;
  category: "tops" | "bottoms";
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedOutfit {
  id: string;
  top_id: string;
  bottom_id: string;
  generated_image_url: string;
  created_at: string;
  updated_at: string;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  CLOTHING: "clothing-images",
  GENERATED: "generated-outfits",
} as const;

// Storage utility functions
export async function uploadImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  fileName: string
): Promise<string> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
  const bucketName = STORAGE_BUCKETS[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  fileName: string
): Promise<void> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
  const bucketName = STORAGE_BUCKETS[bucket];

  const { error } = await supabase.storage.from(bucketName).remove([fileName]);

  if (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export function getImageUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  fileName: string
): string {
  if (!supabase) return "";
  const bucketName = STORAGE_BUCKETS[bucket];

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return data.publicUrl;
}

// Database utility functions
export function pairKey(topId: string, bottomId: string) {
  return `${topId}__${bottomId}`;
}

export async function getCachedComposite(topId: string, bottomId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("generated_outfits")
    .select("generated_image_url")
    .eq("top_id", topId)
    .eq("bottom_id", bottomId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching cached composite:", error);
    return null;
  }

  return data?.generated_image_url || null;
}

export async function saveCachedComposite(
  topId: string,
  bottomId: string,
  generatedImageUrl: string
) {
  if (!supabase) return;
  const { error } = await supabase.from("generated_outfits").upsert({
    top_id: topId,
    bottom_id: bottomId,
    generated_image_url: generatedImageUrl,
  });

  if (error) {
    console.error("Error saving cached composite:", error);
    throw error;
  }
}

export async function getClothingItems(
  category: "tops" | "bottoms"
): Promise<ClothingItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clothing items:", error);
    return [];
  }

  return data || [];
}

export async function addClothingItem(
  name: string,
  category: "tops" | "bottoms",
  imageFile: File
): Promise<ClothingItem> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
  // Generate unique filename. Include a random suffix so that uploading
  // several files in the same millisecond (Promise.all) can't collide and
  // overwrite each other in storage.
  const timestamp = Date.now();
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const fileExtension = imageFile.name.split(".").pop();
  const fileName = `${category}_${timestamp}_${uniqueSuffix}.${fileExtension}`;

  // Upload image to storage
  const imageUrl = await uploadImage("CLOTHING", imageFile, fileName);

  // Save to database
  const { data, error } = await supabase
    .from("clothing_items")
    .insert({
      name,
      category,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding clothing item:", error);
    throw error;
  }

  return data;
}

export async function deleteClothingItem(id: string): Promise<void> {
  if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
  // Get the item to find the image URL
  const { data: item, error: fetchError } = await supabase
    .from("clothing_items")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching clothing item:", fetchError);
    throw fetchError;
  }

  // Extract filename from URL
  const urlParts = item.image_url.split("/");
  const fileName = urlParts[urlParts.length - 1];

  // Delete from storage
  await deleteImage("CLOTHING", fileName);

  // Delete from database
  const { error } = await supabase.from("clothing_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting clothing item:", error);
    throw error;
  }
}
