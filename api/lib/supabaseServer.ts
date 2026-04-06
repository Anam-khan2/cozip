import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    '[supabaseServer] Missing Supabase URL. Set VITE_SUPABASE_URL, SUPABASE_URL, or NEXT_PUBLIC_SUPABASE_URL in your environment.',
  );
}

if (!serviceRoleKey) {
  throw new Error(
    '[supabaseServer] Missing SUPABASE_SERVICE_ROLE_KEY. This is required for server-side admin operations.',
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
