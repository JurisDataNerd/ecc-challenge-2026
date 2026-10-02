import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { detectSessionInUrl: false } })
  : null;

/**
 * Storage upload helper with fallback to base64 / blob mock storage
 */
export async function uploadSubmissionFile(
  file: File,
  enrollmentId: string,
  stageOrdinal: number,
  persist = false,
): Promise<{ url: string; name: string; size: number; type: string }> {
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `${enrollmentId}/stage_${stageOrdinal}/${fileName}`;

  // Simulated submissions must never reach program storage merely because auth is configured.
  if (persist && supabase && isSupabaseConfigured) {
    const { data, error } = await supabase.storage
      .from('ecc-submissions')
      .upload(filePath, file);

    if (error) {
      console.warn('Supabase upload error, using local fallback:', error.message);
    } else if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('ecc-submissions')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }
  }

  // Standalone / Offline simulated upload URL
  const mockUrl = URL.createObjectURL(file);
  return {
    url: mockUrl,
    name: file.name,
    size: file.size,
    type: file.type
  };
}
