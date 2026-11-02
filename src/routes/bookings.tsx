import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ArrowUpLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/tobezly/session';
import { SignInNotice } from '@/components/tobezly/shell';
import { supabase } from '@/integrations/supabase/client';
import { metadata, money, when } from '@/lib/tobezly';
import { toast } from 'sonner';
export const Route = createFileRoute('/bookings')({
  head: () => metadata('حجوزاتي', 'متابعة طلبات حجز المساحات وتأكيدات المضيف وإلغاء الحجوزات.'),
  component: Bookings
});
function Bookings() {
  const {
    t
  } = useLanguage();
  const {
    user,
    ready
  } = useSession();
  const qc = useQueryClient();
  const {
    data: bookings = [],
    isPending
  } = useQuery({
    queryKey: ['bookings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('bookings').select('*,spaces(title)').eq('guest_id', user?.id ?? '').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  return <main className="section-wrap browse-page"><div className="page-heading"><span className="section-kicker"><CalendarDays size={15} />{t("\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</span><h1>{t("\u062D\u062C\u0648\u0632\u0627\u062A\u0643\u060C \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F.")}</h1><p>{t("\u0637\u0644\u0628\u0643 \u064A\u064F\u0624\u0643\u062F \u0628\u0639\u062F \u0645\u0648\u0627\u0641\u0642\u0629 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0633\u0627\u062D\u0629.")}</p></div>{!ready ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026")}</div> : !user ? <SignInNotice /> : isPending ? <div className="empty-state">{t("\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A\u2026")}</div> : bookings.length ? bookings.map(b => <article className="booking-row" key={b.id}><div><h2>{b.spaces?.title ?? t("\u0645\u0633\u0627\u062D\u0629 \u063A\u064A\u0631 \u0645\u0646\u0634\u0648\u0631\u0629")}</h2><p>{when(b.starts_at)} — {when(b.ends_at)}</p><small>{t("\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:")}{b.id.slice(0, 8)}</small></div><strong>{money(b.total)}</strong><span className="status-label">{{
          pending: t("\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0636\u064A\u0641"),
          accepted: t("\u0627\u0644\u062D\u062C\u0632 \u0645\u0624\u0643\u062F"),
          rejected: t("\u0627\u0644\u0637\u0644\u0628 \u0645\u0631\u0641\u0648\u0636"),
          cancelled: t("\u0627\u0644\u062D\u062C\u0632 \u0645\u0644\u063A\u064A")
        }[b.status]}</span>{['pending', 'accepted'].includes(b.status) && <Button variant="outline" onClick={async () => {
        const {
          error
        } = await supabase.rpc('respond_booking', {
          _id: b.id,
          _status: 'cancelled'
        });
        if (error) toast.error(error.message);else {
          toast.success(t("\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u062C\u0632"));
          qc.invalidateQueries({
            queryKey: ['bookings']
          });
        }
      }}>{t("\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u062C\u0632")}</Button>}</article>) : <div className="empty-state"><CalendarDays size={40} /><h2>{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062D\u062C\u0648\u0632\u0627\u062A \u0628\u0639\u062F.")}</h2><Button asChild><Link to="/spaces">{t("\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}<ArrowUpLeft /></Link></Button></div>}</main>;
}
