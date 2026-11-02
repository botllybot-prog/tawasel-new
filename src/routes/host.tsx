import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Plus, Building2, Upload, Clock, Check, Eye, EyeOff, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Field, TextField } from '@/components/tobezly/fields';
import { SignInNotice } from '@/components/tobezly/shell';
import { SpaceImage } from '@/components/tobezly/space-image';
import { useSession } from '@/components/tobezly/session';
import { supabase } from '@/integrations/supabase/client';
import { kinds, money, metadata, when } from '@/lib/tobezly';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
type Space = Database['public']['Tables']['spaces']['Row'];
export const Route = createFileRoute('/host')({
  head: () => metadata('لوحة صاحب المكان', 'أضف المساحات والصور والأسعار بالساعة واليوم، وحدد التوافر وأدر طلبات الحجز.'),
  component: Host
});
function Host() {
  const {
    t
  } = useLanguage();
  const {
    user,
    ready
  } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Space | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [slotSpace, setSlotSpace] = useState<string | null>(null);
  const {
    data: spaces = []
  } = useQuery({
    queryKey: ['my-spaces', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('spaces').select('*').eq('owner_id', user?.id ?? '').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: bookings = []
  } = useQuery({
    queryKey: ['host-bookings', user?.id, spaces.map(s => s.id).join(',')],
    enabled: spaces.length > 0,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('bookings').select('*').in('space_id', spaces.map(s => s.id)).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: slots = []
  } = useQuery({
    queryKey: ['host-slots', slotSpace],
    enabled: !!slotSpace,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('availability').select('*').eq('space_id', slotSpace ?? '').order('starts_at');
      if (error) throw error;
      return data;
    }
  });
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const paths = [...(edit?.photos ?? [])];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        toast.error('الصور يجب أن تكون أقل من 5 ميغابايت');
        setBusy(false);
        return;
      }
      const path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
      const {
        error
      } = await supabase.storage.from('space-photos').upload(path, file);
      if (error) {
        toast.error(error.message);
        setBusy(false);
        return;
      }
      paths.push(path);
    }
    const values = {
      owner_id: user.id,
      title: String(form.get('title')),
      city: String(form.get('city')),
      kind: String(form.get('kind')),
      description: String(form.get('description')),
      hourly_price: Number(form.get('hourly')),
      daily_price: Number(form.get('daily')),
      capacity: Number(form.get('capacity')),
      photos: paths
    };
    const {
      error
    } = edit ? await supabase.from('spaces').update(values).eq('id', edit.id) : await supabase.from('spaces').insert(values);
    setBusy(false);
    if (error) toast.error(error.message);else {
      toast.success(edit ? 'تم تحديث المساحة' : 'تمت إضافة المساحة؛ حدد أوقاتها المتاحة');
      setOpen(false);
      setEdit(null);
      setFiles([]);
      qc.invalidateQueries({
        queryKey: ['my-spaces']
      });
      qc.invalidateQueries({
        queryKey: ['spaces']
      });
    }
  }
  async function respond(id: string, status: string) {
    const {
      error
    } = await supabase.rpc('respond_booking', {
      _id: id,
      _status: status
    });
    if (error) toast.error(error.message);else {
      toast.success(status === 'accepted' ? 'تم تأكيد الحجز' : 'تم رفض الطلب');
      qc.invalidateQueries({
        queryKey: ['host-bookings']
      });
    }
  }
  return <main className="section-wrap browse-page"><div className="page-heading with-action"><div><span className="section-kicker"><Building2 size={15} />{t("\u0637\u0648\u0628\u0632\u0644\u064A \u0644\u0644\u0645\u0636\u064A\u0641\u064A\u0646")}</span><h1>{t("\u0645\u0633\u0627\u062D\u0627\u062A\u0643\u060C \u062A\u062D\u062A \u0625\u062F\u0627\u0631\u062A\u0643.")}</h1><p>{t("\u062D\u062F\u062F \u0627\u0644\u0633\u0639\u0631\u060C \u0627\u0641\u062A\u062D \u0627\u0644\u0623\u0648\u0642\u0627\u062A\u060C \u0648\u0627\u0633\u062A\u0642\u0628\u0644 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0632.")}</p></div>{user && <Button onClick={() => {
        setEdit(null);
        setFiles([]);
        setOpen(true);
      }}><Plus />{t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0627\u062D\u0629")}</Button>}</div>{!ready ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026")}</div> : !user ? <SignInNotice text={t("\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0645\u0633\u0627\u062D\u0627\u062A\u0643")} /> : <><div className="host-stats"><div><span>{t("\u0645\u0633\u0627\u062D\u0627\u062A\u064A")}</span><strong>{spaces.length}</strong></div><div><span>{t("\u0637\u0644\u0628\u0627\u062A \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0631\u062F")}</span><strong>{bookings.filter(b => b.status === 'pending').length}</strong></div><div><span>{t("\u062D\u062C\u0648\u0632\u0627\u062A \u0645\u0624\u0643\u062F\u0629")}</span><strong>{bookings.filter(b => b.status === 'accepted').length}</strong></div></div><h2 className="subsection-title">{t("\u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</h2>{spaces.length ? <div className="host-space-list">{spaces.map(s => <article className="host-space-row" key={s.id}><SpaceImage path={s.photos[0]} /><div><span className="section-kicker">{t(kinds[s.kind]??s.kind)} · {s.published ? t("\u0645\u0646\u0634\u0648\u0631\u0629") : t("\u0645\u062E\u0641\u064A\u0629")}</span><h3>{s.title}</h3><p>{s.city} · {money(s.hourly_price)}{t("/ \u0633\u0627\u0639\u0629 \xB7")}{money(s.daily_price)}{t("/ \u064A\u0648\u0645")}</p></div><div className="host-row-actions"><Button variant="outline" onClick={() => setSlotSpace(s.id)}><Clock />{t("\u0627\u0644\u062A\u0648\u0627\u0641\u0631")}</Button><Button variant="ghost" size="icon" aria-label={t("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")} title={t("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")} onClick={() => {
              setEdit(s);
              setFiles([]);
              setOpen(true);
            }}><Pencil /></Button><Button variant="ghost" size="icon" title={s.published ? t("\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0645\u0633\u0627\u062D\u0629") : t("\u0646\u0634\u0631 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")} aria-label={s.published ? t("\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0645\u0633\u0627\u062D\u0629") : t("\u0646\u0634\u0631 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")} onClick={async () => {
              const {
                error
              } = await supabase.from('spaces').update({
                published: !s.published
              }).eq('id', s.id);
              if (error) toast.error(error.message);else {
                qc.invalidateQueries({
                  queryKey: ['my-spaces']
                });
                qc.invalidateQueries({
                  queryKey: ['spaces']
                });
              }
            }}>{s.published ? <EyeOff /> : <Eye />}</Button></div></article>)}</div> : <div className="empty-state"><Building2 size={40} /><h2>{t("\u0627\u0628\u062F\u0623 \u0628\u0645\u0633\u0627\u062D\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.")}</h2><p>{t("\u0635\u0648\u0631 \u0648\u0627\u0636\u062D\u0629\u060C \u0648\u0635\u0641 \u0635\u0627\u062F\u0642\u060C \u0648\u0633\u0639\u0631 \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0645\u0643\u0627\u0646.")}</p><Button onClick={() => setOpen(true)}><Plus />{t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0627\u062D\u0629")}</Button></div>}<div className="section-heading subsection-title"><h2>{t("\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0632")}</h2><Button asChild variant="link"><Link to="/bookings">{t("\u062D\u062C\u0648\u0632\u0627\u062A\u064A \u0643\u0636\u064A\u0641")}</Link></Button></div>{bookings.length ? bookings.map(b => <div className="booking-row" key={b.id}><div><h3>{spaces.find(s => s.id === b.space_id)?.title}</h3><p>{when(b.starts_at)} — {when(b.ends_at)}</p><small>{t("\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:")}{b.id.slice(0, 8)}</small></div><strong>{money(b.total)}</strong><span className="status-label">{{
            pending: t("\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0631\u062F"),
            accepted: t("\u0645\u0624\u0643\u062F"),
            rejected: t("\u0645\u0631\u0641\u0648\u0636"),
            cancelled: t("\u0645\u0644\u063A\u064A")
          }[b.status]}</span>{b.status === 'pending' && <div className="host-row-actions"><Button onClick={() => respond(b.id, 'accepted')}><Check />{t("\u0642\u0628\u0648\u0644")}</Button><Button variant="outline" onClick={() => respond(b.id, 'rejected')}>{t("\u0631\u0641\u0636")}</Button></div>}</div>) : <p className="muted-empty">{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u062D\u062C\u0632 \u062D\u062A\u0649 \u0627\u0644\u0622\u0646.")}</p>}</>}
<Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl" className="large-dialog"><DialogTitle>{edit ? t("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0629") : t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u0627\u062D\u0629 \u062C\u062F\u064A\u062F\u0629")}</DialogTitle><DialogDescription>{t("\u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0645\u0633\u062A\u0642\u0644\u0629 \u0639\u0646 \u0627\u0644\u062A\u0639\u0627\u0631\u0641\u061B \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0644\u062F\u064A\u0646\u0627\u0631 \u0627\u0644\u0639\u0631\u0627\u0642\u064A.")}</DialogDescription><form className="form-stack" onSubmit={save} key={edit?.id ?? 'new'}><Field label={t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")} name="title" defaultValue={edit?.title} required minLength={3} maxLength={100} /><div className="form-columns"><Field label={t("\u0627\u0644\u0645\u062F\u064A\u0646\u0629")} name="city" defaultValue={edit?.city} required minLength={2} maxLength={80} /><TextField label={t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0643\u0627\u0646")}><select name="kind" defaultValue={edit?.kind ?? 'office'}>{Object.entries(kinds).map(([k, v]) => <option value={k} key={k}>{t(v)}</option>)}</select></TextField></div><TextField label={t("\u0648\u0635\u0641 \u0627\u0644\u0645\u0643\u0627\u0646")}><textarea name="description" defaultValue={edit?.description} required minLength={10} maxLength={2000} /></TextField><div className="form-columns"><Field label={t("\u0627\u0644\u0633\u0639\u0631 \u0628\u0627\u0644\u0633\u0627\u0639\u0629 (\u062F.\u0639)")} name="hourly" type="number" defaultValue={edit?.hourly_price} required min={1} /><Field label={t("\u0627\u0644\u0633\u0639\u0631 \u0628\u0627\u0644\u064A\u0648\u0645 (\u062F.\u0639)")} name="daily" type="number" defaultValue={edit?.daily_price} required min={1} /><Field label={t("\u0639\u062F\u062F \u0627\u0644\u0623\u0634\u062E\u0627\u0635")} name="capacity" type="number" defaultValue={edit?.capacity ?? 2} required min={1} max={100} /></div><label className="upload-area"><Upload /><span>{files.length ? `${files.length} صور مختارة` : t("\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631 \u0627\u0644\u0645\u0643\u0627\u0646")}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => setFiles(Array.from(e.target.files ?? []).slice(0, 8))} /></label><Button type="submit" disabled={busy}>{busy ? t("\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638\u2026") : edit ? t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A") : t("\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")}</Button></form></DialogContent></Dialog>
<Dialog open={!!slotSpace} onOpenChange={v => {
      if (!v) setSlotSpace(null);
    }}><DialogContent dir="rtl"><DialogTitle>{t("\u0627\u0644\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629")}</DialogTitle><DialogDescription>{t("\u062D\u062F\u062F \u0641\u062A\u0631\u0627\u062A \u064A\u0645\u0643\u0646 \u062D\u062C\u0632 \u0627\u0644\u0645\u0643\u0627\u0646 \u0636\u0645\u0646\u0647\u0627.")}</DialogDescription><form className="form-stack" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!slotSpace) return;
          const f = new FormData(e.currentTarget);
          const start = new Date(String(f.get('start')));
          const end = new Date(String(f.get('end')));
          if (end <= start) {
            toast.error(t("\u0627\u0644\u0646\u0647\u0627\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0628\u0639\u062F \u0627\u0644\u0628\u062F\u0627\u064A\u0629"));
            return;
          }
          const {
            error
          } = await supabase.from('availability').insert({
            space_id: slotSpace,
            starts_at: start.toISOString(),
            ends_at: end.toISOString()
          });
          if (error) toast.error(error.message);else {
            toast.success(t("\u0623\u0636\u064A\u0641 \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u062A\u0627\u062D"));
            qc.invalidateQueries({
              queryKey: ['host-slots']
            });
            qc.invalidateQueries({
              queryKey: ['slots']
            });
          }
        }}><Field label={t("\u0628\u062F\u0627\u064A\u0629 \u0627\u0644\u0641\u062A\u0631\u0629")} name="start" type="datetime-local" required /><Field label={t("\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0641\u062A\u0631\u0629")} name="end" type="datetime-local" required /><Button type="submit"><Plus />{t("\u0625\u0636\u0627\u0641\u0629 \u0648\u0642\u062A \u0645\u062A\u0627\u062D")}</Button></form><div className="slot-list">{slots.map(s => <div key={s.id}><span>{when(s.starts_at)} — {when(s.ends_at)}</span><Button variant="ghost" onClick={async () => {
              const {
                error
              } = await supabase.from('availability').delete().eq('id', s.id);
              if (error) toast.error(error.message);else qc.invalidateQueries({
                queryKey: ['host-slots']
              });
            }}>{t("\u062D\u0630\u0641")}</Button></div>)}</div></DialogContent></Dialog></main>;
}
