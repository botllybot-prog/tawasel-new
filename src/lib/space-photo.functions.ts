import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { isPublishedSpacePhoto, spacePhotoPath } from './space-photo-access';

// Only exact photos attached to published listings can receive a public link.
export const getPublishedSpacePhoto = createServerFn({ method: 'GET' })
  .inputValidator((input: { path: string }) => ({ path: spacePhotoPath.parse(input.path) }))
  .handler(async ({ data: input }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error('تعذر تحميل الصورة');
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (request, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(request, { ...init, headers });
      } },
    });
    const { data, error } = await client.from('spaces')
      .select('owner_id,published,photos').eq('published', true)
      .contains('photos', [input.path]);
    if (error) throw new Error('تعذر تحميل الصورة');
    if (!data?.some(listing => isPublishedSpacePhoto(input.path, listing))) return null;
    // Privileged signing is reached only after authorization through public RLS.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('space-photos').createSignedUrl(input.path, 60);
    if (signError || !signed) throw new Error('تعذر تحميل الصورة');
    // The server's internal origin is never returned to the browser.
    const signedUrl = new URL(signed.signedUrl);
    return signedUrl.pathname + signedUrl.search;
  });