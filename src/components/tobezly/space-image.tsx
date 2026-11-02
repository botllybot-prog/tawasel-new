import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';
import { getPublishedSpacePhoto } from '@/lib/space-photo.functions';
import { useSession } from './session';

export function SpaceImage({ path }: { path?: string | undefined }) {
  const { user } = useSession();
  const getPublicPhoto = useServerFn(getPublishedSpacePhoto);
  const { data: url } = useQuery({
    queryKey: ['space-photo', path, user?.id],
    enabled: !!path,
    staleTime: 30_000,
    refetchInterval: 45_000,
    queryFn: async () => {
      if (!path) return null;
      if (user && path.split('/')[0] === user.id) {
        const { data, error } = await supabase.storage.from('space-photos').createSignedUrl(path, 60);
        if (error) throw error;
        return data?.signedUrl ?? null;
      }
      const signedPath = await getPublicPhoto({ data: { path } });
      return signedPath ? new URL(signedPath, import.meta.env.VITE_SUPABASE_URL).href : null;
    },
  });
  return <div className="space-image">{url ? <img src={url} alt="صورة المكان" loading="lazy" /> : <Building2 size={45} strokeWidth={1} />}</div>;
}
