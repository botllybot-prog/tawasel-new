import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { UserRound, ShieldCheck, LockKeyhole, Upload, Trash2, Ban, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, TextField, Interests } from '@/components/tobezly/fields';
import { SignInNotice } from '@/components/tobezly/shell';
import { useSession } from '@/components/tobezly/session';
import { supabase } from '@/integrations/supabase/client';
import { isAdult, metadata } from '@/lib/tobezly';
import { toast } from 'sonner';
export const Route = createFileRoute('/account')({
  head: () => metadata('ملفي وخصوصيتي', 'الاسم المستعار والاهتمامات والتحكم بظهور الصور والمدينة وإدارة الحسابات المحظورة.'),
  component: Account
});
function Account() {
  const {
    t
  } = useLanguage();
  const {
    user,
    ready
  } = useSession();
  const qc = useQueryClient();
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    data: profile
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
    data: photos = []
  } = useQuery({
    queryKey: ['my-photos', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profile_photos').select('*').eq('user_id', user?.id ?? '');
      if (error) throw error;
      return Promise.all(data.map(async p => ({
        ...p,
        url: (await supabase.storage.from('profile-photos').createSignedUrl(p.path, 300)).data?.signedUrl
      })));
    }
  });
  const {
    data: blocks = []
  } = useQuery({
    queryKey: ['blocks', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data
      } = await supabase.from('blocks').select('*');
      return data ?? [];
    }
  });
  const {
    data: moderator
  } = useQuery({
    queryKey: ['moderator', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data
      } = await supabase.rpc('is_moderator');
      return data;
    }
  });
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !profile) return;
    const f = new FormData(e.currentTarget);
    const birth = String(f.get('birth'));
    if (!isAdult(birth)) {
      toast.error('يجب أن يكون عمرك 18 سنة أو أكثر');
      return;
    }
    setBusy(true);
    const {
      error
    } = await supabase.from('profiles').update({
      nickname: String(f.get('nickname')),
      birth_date: birth,
      city: String(f.get('city')),
      bio: String(f.get('bio')),
      interests: chosen ?? profile.interests,
      discoverable: !!f.get('discoverable'),
      show_city: !!f.get('show_city'),
      photo_visibility: String(f.get('visibility'))
    }).eq('id', user.id);
    setBusy(false);
    if (error) toast.error(error.message);else {
      toast.success('تم حفظ ملفك وإعدادات الخصوصية');
      qc.invalidateQueries({
        queryKey: ['profile']
      });
      qc.invalidateQueries({
        queryKey: ['people']
      });
    }
  }
  return <main className="section-wrap browse-page"><div className="page-heading"><span className="section-kicker"><UserRound size={15} />{t("\u0645\u0633\u0627\u062D\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629")}</span><h1>{t("\u0623\u0646\u062A \u062A\u062E\u062A\u0627\u0631 \u0645\u0627 \u062A\u0634\u0627\u0631\u0643\u0647.")}</h1><p>{t("\u0627\u0633\u0645\u0643 \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0631\u060C \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0643\u060C \u0648\u062D\u062F\u0648\u062F \u062E\u0635\u0648\u0635\u064A\u062A\u0643.")}</p></div>{!ready ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026")}</div> : !user ? <SignInNotice /> : !profile ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0644\u0641\u2026")}</div> : <div className="account-layout"><aside className="account-sidebar"><div className="account-avatar"><UserRound size={38} /></div><h2>{profile.nickname}</h2><span className="verified"><ShieldCheck size={15} />{t("\u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0648\u062B\u0651\u0642")}</span><p>{t("\u0644\u0627 \u064A\u0638\u0647\u0631 \u0628\u0631\u064A\u062F\u0643 \u0623\u0648 \u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F\u0643 \u0644\u0623\u064A \u0634\u062E\u0635.")}</p><Button asChild variant="outline"><Link to="/dating" search={{interest:""}}><Heart />{t("\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0623\u0634\u062E\u0627\u0635")}</Link></Button>{moderator && <Button asChild variant="outline"><Link to="/moderation">{t("\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A")}</Link></Button>}</aside><div><form className="form-stack settings-form" onSubmit={save} key={profile.id}><h2>{t("\u0645\u0644\u0641\u064A \u0627\u0644\u0634\u062E\u0635\u064A")}</h2><div className="form-columns"><Field label={t("\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0631")} name="nickname" defaultValue={profile.nickname} required minLength={2} maxLength={40} /><Field label={t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F (\u062E\u0627\u0635)")} name="birth" type="date" defaultValue={profile.birth_date ?? ''} required /><Field label={t("\u0627\u0644\u0645\u062F\u064A\u0646\u0629")} name="city" defaultValue={profile.city} maxLength={80} /></div><TextField label={t("\u0646\u0628\u0630\u0629 \u0639\u0646\u0643")}><textarea name="bio" defaultValue={profile.bio} maxLength={1000} placeholder={t("\u0634\u064A\u0621 \u0635\u063A\u064A\u0631 \u0639\u0646\u0643\u060C \u0642\u062F \u064A\u0643\u0648\u0646 \u0628\u062F\u0627\u064A\u0629 \u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0644.")} /></TextField><TextField label={t("\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0643")}><Interests value={chosen ?? profile.interests} onChange={setChosen} /></TextField><h2 className="subsection-title"><LockKeyhole size={21} />{t("\u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0648\u0627\u0644\u0638\u0647\u0648\u0631")}</h2><label className="check-label"><input type="checkbox" name="discoverable" defaultChecked={profile.discoverable} />{t("\u0625\u0638\u0647\u0627\u0631 \u0645\u0644\u0641\u064A \u0641\u064A \u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u0639\u0627\u0631\u0641")}</label><label className="check-label"><input type="checkbox" name="show_city" defaultChecked={profile.show_city} />{t("\u0625\u0638\u0647\u0627\u0631 \u0645\u062F\u064A\u0646\u062A\u064A \u0644\u0644\u0622\u062E\u0631\u064A\u0646")}</label><TextField label={t("\u0645\u0646 \u064A\u0645\u0643\u0646\u0647 \u0631\u0624\u064A\u0629 \u0635\u0648\u0631\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629\u061F")}><select name="visibility" defaultValue={profile.photo_visibility}><option value="private">{t("\u0623\u0646\u0627 \u0641\u0642\u0637")}</option><option value="mutual">{t("\u0628\u0639\u062F \u0627\u0644\u0625\u0639\u062C\u0627\u0628 \u0627\u0644\u0645\u062A\u0628\u0627\u062F\u0644")}</option><option value="public">{t("\u0623\u0639\u0636\u0627\u0621 \u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u0639\u0627\u0631\u0641")}</option></select></TextField><Button type="submit" disabled={busy}><Check />{busy ? t("\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638\u2026") : t("\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A")}</Button></form><section className="settings-section"><h2><Upload size={21} />{t("\u0635\u0648\u0631\u064A \u0627\u0644\u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629")}</h2><p>{t("\u062A\u064F\u0631\u0627\u062C\u0639 \u0627\u0644\u0635\u0648\u0631 \u0642\u0628\u0644 \u0638\u0647\u0648\u0631\u0647\u0627 \u0644\u0644\u0622\u062E\u0631\u064A\u0646. \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0639\u0627\u0631\u064A\u0629 \u0645\u0645\u0646\u0648\u0639\u0629.")}</p><label className="upload-area"><Upload /><span>{t("\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629")}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e => {
              const file = e.target.files?.[0];
              if (!file || !user) return;
              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                toast.error(t("\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629 JPG \u0623\u0648 PNG \u0623\u0648 WebP \u0623\u0642\u0644 \u0645\u0646 5 \u0645\u064A\u063A\u0627\u0628\u0627\u064A\u062A"));
                return;
              }
              setBusy(true);
              const path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
              const upload = await supabase.storage.from('profile-photos').upload(path, file);
              if (upload.error) toast.error(upload.error.message);else {
                const {
                  error
                } = await supabase.from('profile_photos').insert({
                  user_id: user.id,
                  path
                });
                if (error) toast.error(error.message);else {
                  toast.success(t("\u0623\u0636\u064A\u0641\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u062A\u0646\u062A\u0638\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629"));
                  qc.invalidateQueries({
                    queryKey: ['my-photos']
                  });
                }
              }
              setBusy(false);
            }} /></label><div className="photo-grid">{photos.map(p => <div className="photo-item" key={p.id}><img src={p.url} alt={t("\u0635\u0648\u0631\u062A\u064A")} /><span>{p.status === 'pending' ? t("\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629") : p.status === 'approved' ? t("\u0645\u0639\u062A\u0645\u062F\u0629") : t("\u0645\u0631\u0641\u0648\u0636\u0629")}</span><Button variant="ghost" size="icon" aria-label={t("\u062D\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629")} onClick={async () => {
                const {
                  error
                } = await supabase.from('profile_photos').delete().eq('id', p.id);
                if (error) toast.error(error.message);else qc.invalidateQueries({
                  queryKey: ['my-photos']
                });
              }}><Trash2 /></Button></div>)}</div></section><section className="settings-section"><h2><Ban size={21} />{t("\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u062D\u0638\u0648\u0631\u0629")}</h2>{blocks.length ? blocks.map((b, i) => <div className="list-row" key={b.target_id}><span>{t("\u062D\u0633\u0627\u0628 \u0645\u062D\u0638\u0648\u0631")}{i + 1}</span><Button variant="outline" onClick={async () => {
              await supabase.from('blocks').delete().eq('user_id', user.id).eq('target_id', b.target_id);
              qc.invalidateQueries({
                queryKey: ['blocks']
              });
              qc.invalidateQueries({
                queryKey: ['people']
              });
            }}>{t("\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u0638\u0631")}</Button></div>) : <p>{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062D\u0633\u0627\u0628\u0627\u062A \u0645\u062D\u0638\u0648\u0631\u0629.")}</p>}</section></div></div>}</main>;
}
