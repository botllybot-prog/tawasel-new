import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Heart, ShieldCheck, Flag, Ban, MessageCircle, UserRound, SlidersHorizontal, Search, ArrowUpLeft, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSession } from '@/components/tobezly/session';
import { SignInNotice } from '@/components/tobezly/shell';
import { supabase } from '@/integrations/supabase/client';
import { interests, metadata } from '@/lib/tobezly';
import { toast } from 'sonner';
export const Route = createFileRoute('/dating')({
  validateSearch: (s: Record<string, unknown>) => ({
    interest: typeof s['interest'] === 'string' ? s['interest'] : ''
  }),
  head: () => metadata('اكتشف من يشبهك', 'تعارف آمن للبالغين عبر الاهتمامات المشتركة، مع الإعجاب المتبادل والإبلاغ والحظر.'),
  component: Dating
});
type Person = {
  id: string;
  nickname: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  liked: boolean;
  mutual: boolean;
};
function Dating() {
  const {
    t
  } = useLanguage();
  const {
    user,
    ready
  } = useSession();
  const qc = useQueryClient();
  const initial = Route.useSearch().interest;
  const [topic, setTopic] = useState(initial);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);
  const [action, setAction] = useState<'report' | 'chat' | null>(null);
  const {
    data: people = [],
    isPending,
    error
  } = useQuery({
    queryKey: ['people', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc('discover_people');
      if (error) throw error;
      return data as Person[];
    }
  });
  const {
    data: own
  } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user?.id ?? '').single();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: messages = []
  } = useQuery({
    queryKey: ['chat', selected?.id],
    enabled: action === 'chat' && !!selected,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('messages').select('*').or(`sender_id.eq.${selected?.id},recipient_id.eq.${selected?.id}`).order('created_at');
      if (error) throw error;
      return data;
    }
  });
  async function like(p: Person) {
    if (!user) return;
    const r = p.liked ? await supabase.from('likes').delete().eq('user_id', user.id).eq('target_id', p.id) : await supabase.from('likes').insert({
      user_id: user.id,
      target_id: p.id
    });
    if (r.error) toast.error(r.error.message);else qc.invalidateQueries({
      queryKey: ['people']
    });
  }
  async function block(p: Person) {
    if (!user) return;
    const {
      error
    } = await supabase.from('blocks').insert({
      user_id: user.id,
      target_id: p.id
    });
    if (error) toast.error(error.message);else {
      toast.success('تم حظر الحساب وإخفاؤه');
      setSelected(null);
      qc.invalidateQueries({
        queryKey: ['people']
      });
    }
  }
  return <main className="section-wrap browse-page"><div className="page-heading"><span className="section-kicker"><Heart size={15} />{t("\u0645\u062C\u062A\u0645\u0639 \u0637\u0648\u0628\u0632\u0644\u064A")}</span><h1>{t("\u0623\u0634\u062E\u0627\u0635 \u064A\u0634\u0628\u0647\u0648\u0646\u0643.")}</h1><p>{t("\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A \u062A\u062C\u0645\u0639\u0643\u0645\u060C \u0648\u062D\u0643\u0627\u064A\u0627\u062A \u062A\u0646\u062A\u0638\u0631 \u0627\u0644\u0628\u062F\u0627\u064A\u0629.")}</p></div><div className="browse-tools"><label className="search-field"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0646\u0629")} /></label><span className="filter-caption"><SlidersHorizontal size={16} />{t("\u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A")}</span><select aria-label={t("\u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A")} value={topic} onChange={e => setTopic(e.target.value)}><option value="">{t("\u0643\u0644 \u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A")}</option>{interests.map(i => <option key={i} value={i}>{t(i)}</option>)}</select></div>{!ready ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026")}</div> : !user ? <SignInNotice text={t("\u0645\u062C\u062A\u0645\u0639 \u0637\u0648\u0628\u0632\u0644\u064A \u0644\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u062B\u0651\u0642\u0629")} /> : !own?.birth_date ? <div className="empty-state"><ShieldCheck /><h2>{t("\u0623\u0643\u0645\u0644 \u0645\u0644\u0641\u0643 \u0648\u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F\u0643 \u0623\u0648\u0644\u0627\u064B")}</h2><Button asChild><Link to="/account">{t("\u0623\u0643\u0645\u0644 \u062D\u0633\u0627\u0628\u0643")}</Link></Button></div> : isPending ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0623\u0634\u062E\u0627\u0635\u2026")}</div> : error ? <p role="alert" className="form-error">{t("\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0623\u0634\u062E\u0627\u0635. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.")}</p> : <><div className="results-heading"><span>{people.filter(p => (!topic || p.interests.includes(topic)) && `${p.nickname} ${p.city}`.includes(search)).length}{t("\u0634\u062E\u0635\u064B\u0627")}</span><span><LockKeyhole size={14} />{t("\u0635\u0648\u0631 \u0628\u062D\u0633\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0623\u0635\u062D\u0627\u0628\u0647\u0627")}</span></div><div className="people-grid">{people.filter(p => (!topic || p.interests.includes(topic)) && `${p.nickname} ${p.city}`.includes(search)).map(p => <article className="person-card" key={p.id}><PersonPhoto id={p.id} /><div className="person-body"><h2>{p.nickname}<span>{p.age}</span><ShieldCheck size={17} /></h2><p className="person-city">{p.city || t("\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u063A\u064A\u0631 \u0638\u0627\u0647\u0631\u0629")}</p><p className="person-bio">{p.bio || t("\u0628\u062F\u0627\u064A\u0629 \u062C\u062F\u064A\u062F\u0629 \u0648\u062D\u0643\u0627\u064A\u0629 \u0645\u062E\u062A\u0644\u0641\u0629.")}</p><div className="tags">{p.interests.map(i => <span key={i}>{i}</span>)}</div><div className="person-actions"><Button onClick={() => like(p)} variant={p.liked ? 'default' : 'outline'}><Heart fill={p.liked ? 'currentColor' : 'none'} />{p.liked ? t("\u0623\u0639\u062C\u0628\u062A \u0628\u0647") : t("\u0625\u0639\u062C\u0627\u0628")}</Button>{p.mutual && <Button variant="outline" aria-label={t("\u0645\u0631\u0627\u0633\u0644\u0629")} onClick={() => {
                setSelected(p);
                setAction('chat');
              }}><MessageCircle /></Button>}<Button variant="ghost" size="icon" title={t("\u0627\u0644\u0625\u0628\u0644\u0627\u063A")} aria-label={`إبلاغ عن ${p.nickname}`} onClick={() => {
                setSelected(p);
                setAction('report');
              }}><Flag /></Button><Button variant="ghost" size="icon" title={t("\u0627\u0644\u062D\u0638\u0631")} aria-label={`حظر ${p.nickname}`} onClick={() => block(p)}><Ban /></Button></div></div></article>)}</div>{people.length === 0 && <div className="empty-state"><Heart size={40} /><h2>{t("\u0623\u0646\u062A \u0645\u0646 \u0623\u0648\u0627\u0626\u0644 \u0645\u062C\u062A\u0645\u0639 \u0637\u0648\u0628\u0632\u0644\u064A.")}</h2><p>{t("\u0633\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u064A \u0627\u062E\u062A\u0627\u0631\u062A \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645 \u0644\u0644\u062A\u0639\u0627\u0631\u0641.")}</p><Button asChild variant="outline"><Link to="/account">{t("\u0625\u0639\u062F\u0627\u062F \u0645\u0644\u0641\u064A")}<ArrowUpLeft /></Link></Button></div>}</>}
<Dialog open={!!selected && !!action} onOpenChange={v => {
      if (!v) {
        setSelected(null);
        setAction(null);
      }
    }}><DialogContent dir="rtl"><DialogTitle>{action === 'report' ? t("\u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u062D\u0633\u0627\u0628") : `حديث مع ${selected?.nickname}`}</DialogTitle><DialogDescription>{action === 'report' ? t("\u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0633\u0631\u064A \u0648\u064A\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629.") : t("\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u062A\u0627\u062D \u0628\u0639\u062F \u0625\u0639\u062C\u0627\u0628 \u0645\u062A\u0628\u0627\u062F\u0644.")}</DialogDescription>{action === 'report' ? <form className="form-stack" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!user || !selected) return;
          const {
            error
          } = await supabase.from('reports').insert({
            user_id: user.id,
            target_id: selected.id,
            reason: String(new FormData(e.currentTarget).get('reason'))
          });
          if (error) toast.error(error.message);else {
            toast.success(t("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0644\u0627\u063A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629"));
            setSelected(null);
          }
        }}><textarea name="reason" required minLength={3} maxLength={1000} placeholder={t("\u0633\u0628\u0628 \u0627\u0644\u0625\u0628\u0644\u0627\u063A")} /><Button type="submit"><Flag />{t("\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0644\u0627\u063A")}</Button></form> : <><div className="chat-messages">{messages.length ? messages.map(m => <p key={m.id} className={m.sender_id === user?.id ? 'message mine' : 'message'}>{m.body}</p>) : <p className="text-muted-foreground">{t("\u0627\u0628\u062F\u0623 \u0627\u0644\u062D\u062F\u064A\u062B \u0628\u062A\u062D\u064A\u0629.")}</p>}</div><form className="chat-input" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!user || !selected) return;
            const form = e.currentTarget;
            const {
              error
            } = await supabase.from('messages').insert({
              sender_id: user.id,
              recipient_id: selected.id,
              body: String(new FormData(form).get('body'))
            });
            if (error) toast.error(error.message);else {
              form.reset();
              qc.invalidateQueries({
                queryKey: ['chat']
              });
            }
          }}><input name="body" required maxLength={2000} placeholder={t("\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u0629\u2026")} /><Button type="submit">{t("\u0625\u0631\u0633\u0627\u0644")}</Button></form></>}</DialogContent></Dialog></main>;
}
function PersonPhoto({
  id
}: {
  id: string;
}) {
  const {
    t
  } = useLanguage();
  const {
    data: photo
  } = useQuery({
    queryKey: ['person-photo', id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('profile_photos').select('path').eq('user_id', id).eq('status', 'approved').limit(1);
      if (!data?.[0]) return null;
      const {
        data: signed
      } = await supabase.storage.from('profile-photos').createSignedUrl(data[0].path, 300);
      return signed?.signedUrl;
    }
  });
  return <div className="person-photo">{photo ? <img src={photo} alt={t("\u0635\u0648\u0631\u0629 \u0627\u062E\u062A\u0627\u0631 \u0635\u0627\u062D\u0628 \u0627\u0644\u062D\u0633\u0627\u0628 \u0625\u0638\u0647\u0627\u0631\u0647\u0627")} loading="lazy" /> : <><UserRound size={60} strokeWidth={1} /><span><LockKeyhole size={13} />{t("\u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0638\u0627\u0647\u0631\u0629")}</span></>}</div>;
}
