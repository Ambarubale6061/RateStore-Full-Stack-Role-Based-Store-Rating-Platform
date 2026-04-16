const { createClient } = require('@supabase/supabase-js');

// We use the Supabase JS client ONLY for Storage.
// Auth is handled by our own JWT system. DB is accessed via pg pool directly.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // service role needed for server-side storage ops
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'store-images';

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL on success.
 */
const uploadImage = async (fileBuffer, fileName, mimeType) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true // overwrite if same filename
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
};

/**
 * Delete a file from Supabase Storage by its path.
 */
const deleteImage = async (filePath) => {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) {
    // log but don't throw — deletion failure shouldn't break main ops
    console.warn('Storage delete warning:', error.message);
  }
};

/**
 * Extract the storage path from a full public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/store-images/stores/abc.jpg"
 *   -> "stores/abc.jpg"
 */
const extractPathFromUrl = (publicUrl) => {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  } catch {
    return null;
  }
};

module.exports = { uploadImage, deleteImage, extractPathFromUrl, BUCKET };
