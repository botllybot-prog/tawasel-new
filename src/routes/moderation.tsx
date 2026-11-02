import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/tobezly/session';
import { SignInNotice } from '@/components/tobezly/shell';
import { supabase } from '@/integrations/supabase/client';
import { metadata, when } from '@/lib/tobezly';
import { toast } from 'sonner';
export const Route = createFileRoute('/moderation')({
  head: () => metadata('مراجعة المجتمع', 'مراجعة الصور والبلاغات من قبل المشرفين المخولين فقط.'),
  component: Moderation
});
function Moderation() {
  const {
    t
  } = useLanguage();
  const {
    user
  } = useSession();
  const qc = useQueryClient();
  const {
    data: allowed
  } = useQuery({
    queryKey: ['moderator', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc('is_moderator');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: photos = []
  } = useQuery({
    queryKey: ['review-photos'],
    enabled: !!allowed,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profile_photos').select('*').eq('status', 'pending');
      if (error) throw error;
      return Promise.all(data.map(async p => ({
        ...p,
        url: (await supabase.storage.from('profile-photos').createSignedUrl(p.path, 300)).data?.signedUrl
      })));
    }
  });
  const {
    data: reports = []
  } = useQuery({
    queryKey: ['review-reports'],
    enabled: !!allowed,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('reports').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  return <main className="section-wrap browse-page"><div className="page-heading"><h1>{t("\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062C\u062A\u0645\u0639")}</h1><p>{t("\u064A\u064F\u0645\u0646\u0639 \u0646\u0634\u0631 \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0639\u0627\u0631\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u0633\u064A\u0626\u0629 \u0623\u0648 \u0627\u0644\u062A\u064A \u062A\u0646\u062A\u0647\u0643 \u062E\u0635\u0648\u0635\u064A\u0629 \u0627\u0644\u0622\u062E\u0631\u064A\u0646.")}</p></div>{!user ? <SignInNotice /> : !allowed ? <div className="empty-state">{t("\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u0644\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0627\u0644\u0645\u062E\u0648\u0644\u064A\u0646 \u0641\u0642\u0637.")}</div> : <><h2>{t("\u0635\u0648\u0631 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629")}</h2><div className="photo-grid review-grid">{photos.map(p => <article key={p.id}><img src={p.url} alt={t("\u0635\u0648\u0631\u0629 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629")} /><div className="host-row-actions">{['approved', 'rejected'].map(status => <Button key={status} variant={status === 'approved' ? 'default' : 'outline'} onClick={async () => {
              const {
                error
              } = await supabase.from('profile_photos').update({
                status
              }).eq('id', p.id);
              if (error) toast.error(error.message);else {
                toast.success(t("\u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0635\u0648\u0631\u0629"));
                qc.invalidateQueries({
                  queryKey: ['review-photos']
                });
              }
            }}>{status === 'approved' ? t("\u0627\u0639\u062A\u0645\u0627\u062F") : t("\u0631\u0641\u0636")}</Button>)}</div></article>)}</div>{!photos.length && <p className="muted-empty">{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629.")}</p>}<h2 className="subsection-title">{t("\u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A")}</h2>{reports.map(r => <div className="list-row" key={r.id}><div><p>{r.reason}</p><small>{t("\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0628\u0644\u0651\u063A \u0639\u0646\u0647:")}{r.target_id.slice(0, 8)} · {when(r.created_at)}</small></div></div>)}{!reports.length && <p className="muted-empty">{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u0644\u0627\u063A\u0627\u062A.")}</p>}</>}</main>;
}
