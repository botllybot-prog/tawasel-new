import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useSuspenseQuery, queryOptions, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { ArrowRight, MapPin, Users, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, TextField } from '@/components/tobezly/fields';
import { SpaceImage } from '@/components/tobezly/space-image';
import { listSpaces } from '@/lib/tobezly.functions';
import { useSession } from '@/components/tobezly/session';
import { supabase } from '@/integrations/supabase/client';
import { kinds, money, priceFor, metadata, when } from '@/lib/tobezly';
import { toast } from 'sonner';
const spacesQuery = queryOptions({
  queryKey: ['spaces'],
  queryFn: () => listSpaces()
});
export const Route = createFileRoute('/spaces_/$id')({
  loader: ({
    context
  }) => context.queryClient.ensureQueryData(spacesQuery),
  head: () => metadata('تفاصيل المساحة والحجز', 'صور المكان وأسعار الساعة واليوم والأوقات المتاحة وإرسال طلب حجز مستقل.'),
  component: Details
});
function Details() {
  const {
    t
  } = useLanguage();
  const {
    id
  } = Route.useParams();
  const {
    user
  } = useSession();
  const qc = useQueryClient();
  const {
    data: spaces
  } = useSuspenseQuery(spacesQuery);
  const space = spaces.find(s => s.id === id);
  const [mode, setMode] = useState('hour');
  const [hours, setHours] = useState(1);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState('');
  const {
    data: slots = []
  } = useQuery({
    queryKey: ['slots', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('availability').select('*').eq('space_id', id).order('starts_at');
      if (error) throw error;
      return data;
    }
  });
  if (!space) return <main className="section-wrap empty-state"><h1>{t("\u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629")}</h1><Button asChild><Link to="/spaces">{t("\u0643\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</Link></Button></main>;
  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!space) return;
    const start = new Date(String(new FormData(e.currentTarget).get('start')));
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + (mode === 'day' ? 24 : hours) * 3600000);
    setBusy(true);
    const {
      data,
      error
    } = await supabase.rpc('request_booking', {
      _space_id: id,
      _start: start.toISOString(),
      _end: end.toISOString(),
      _mode: mode
    });
    setBusy(false);
    if (error) toast.error(error.message);else {
      setConfirmed(data);
      qc.invalidateQueries({
        queryKey: ['bookings']
      });
    }
  }
  return <main className="section-wrap browse-page"><Button asChild variant="link"><Link to="/spaces"><ArrowRight />{t("\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</Link></Button><div className="space-detail"><div><div className="detail-gallery">{space.photos.length ? space.photos.map(path => <SpaceImage key={path} path={path} />) : <SpaceImage />}</div><span className="section-kicker">{t(kinds[space.kind]??space.kind)}</span><h1>{space.title}</h1><div className="detail-meta"><span><MapPin size={17} />{space.city}</span><span><Users size={17} />{space.capacity}{t("\u0623\u0634\u062E\u0627\u0635")}</span></div><h2>{t("\u0639\u0646 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")}</h2><p className="description">{space.description}</p><h2><Clock size={20} />{t("\u0627\u0644\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062A\u064A \u0623\u062A\u0627\u062D\u0647\u0627 \u0627\u0644\u0645\u0636\u064A\u0641")}</h2><div className="slot-list">{slots.length ? slots.map(s => <div key={s.id}><span>{when(s.starts_at)}</span><ArrowRight size={14} /><span>{when(s.ends_at)}</span></div>) : <p>{t("\u0644\u0645 \u064A\u062D\u062F\u062F \u0627\u0644\u0645\u0636\u064A\u0641 \u0623\u0648\u0642\u0627\u062A\u064B\u0627 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F.")}</p>}</div></div><aside className="booking-tool"><h2>{t("\u062D\u062C\u0632 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")}</h2><div className="price-line"><strong>{money(space.hourly_price)}</strong><span>{t("\u0644\u0644\u0633\u0627\u0639\u0629")}</span></div><div className="price-line"><strong>{money(space.daily_price)}</strong><span>{t("\u0644\u0644\u064A\u0648\u0645 (24 \u0633\u0627\u0639\u0629)")}</span></div>{confirmed ? <div className="form-success"><ShieldCheck size={30} /><h3>{t("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632")}</h3><p>{t("\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0643\u0627\u0646. \u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0623\u064A \u0645\u0628\u0644\u063A.")}</p><small>{t("\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:")}{confirmed.slice(0, 8)}</small><Button asChild variant="outline"><Link to="/bookings">{t("\u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u062C\u0632\u064A")}</Link></Button></div> : <form className="form-stack" onSubmit={book}><div className="segmented"><Button type="button" variant={mode === 'hour' ? 'default' : 'ghost'} onClick={() => setMode('hour')}>{t("\u0628\u0627\u0644\u0633\u0627\u0639\u0629")}</Button><Button type="button" variant={mode === 'day' ? 'default' : 'ghost'} onClick={() => setMode('day')}>{t("\u0628\u0627\u0644\u064A\u0648\u0645")}</Button></div><Field label={t("\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u0628\u062F\u0627\u064A\u0629")} name="start" type="datetime-local" required />{mode === 'hour' && <Field label={t("\u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A")} type="number" min={1} max={24} value={hours} onChange={e => setHours(Number(e.target.value))} required />}<div className="booking-total"><span>{t("\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A")}</span><strong>{money(priceFor(mode, hours, space.hourly_price, space.daily_price))}</strong></div>{user ? <Button type="submit" disabled={busy || slots.length === 0 || space.owner_id === user.id}>{busy ? t("\u062C\u0627\u0631\u064D \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628\u2026") : space.owner_id === user.id ? t("\u0647\u0630\u0647 \u0645\u0633\u0627\u062D\u062A\u0643") : t("\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u062D\u062C\u0632")}</Button> : <Button asChild><Link to="/auth">{t("\u0633\u062C\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u062D\u062C\u0632")}</Link></Button>}<p className="booking-note">{t("\u0627\u0644\u0637\u0644\u0628 \u064A\u062E\u0636\u0639 \u0644\u0644\u062A\u0648\u0627\u0641\u0631 \u0648\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0636\u064A\u0641. \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644.")}</p></form>}</aside></div></main>;
}
