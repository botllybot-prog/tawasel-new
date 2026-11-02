import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { useState } from 'react';
import { Building2, Search, MapPin, Users, ArrowUpLeft, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listSpaces } from '@/lib/tobezly.functions';
import { kinds, money, metadata } from '@/lib/tobezly';
import studio from '@/assets/meeting-studio.jpg';
import { SpaceImage } from '@/components/tobezly/space-image';
const spacesQuery = queryOptions({
  queryKey: ['spaces'],
  queryFn: () => listSpaces()
});
export const Route = createFileRoute('/spaces')({
  loader: ({
    context
  }) => context.queryClient.ensureQueryData(spacesQuery),
  head: () => metadata('المساحات', 'منصة مستقلة لتأجير المكاتب والمنازل والاستوديوهات بالساعة أو باليوم مع أسعار واضحة.'),
  component: Spaces
});
function Spaces() {
  const {
    t
  } = useLanguage();
  const {
    data: spaces
  } = useSuspenseQuery(spacesQuery);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  return <main><section className="spaces-intro"><div className="section-wrap"><span className="section-kicker"><Building2 size={15} />{t("\u0637\u0648\u0628\u0632\u0644\u064A \u0644\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</span><h1>{t("\u0645\u0633\u0627\u062D\u0629 \u0644\u0643\u0644 \u0641\u0643\u0631\u0629.")}</h1><p>{t("\u0644\u0639\u0645\u0644\u0643\u060C \u0625\u0628\u062F\u0627\u0639\u0643\u060C \u0623\u0648 \u064A\u0648\u0645 \u0645\u062E\u062A\u0644\u0641. \u0627\u062D\u062C\u0632 \u0628\u0627\u0644\u0633\u0627\u0639\u0629 \u0623\u0648 \u0628\u0627\u0644\u064A\u0648\u0645.")}</p><div className="browse-tools"><label className="search-field"><Search size={19} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("\u0623\u064A \u0645\u062F\u064A\u0646\u0629 \u0623\u0648 \u0645\u0633\u0627\u062D\u0629 \u062A\u0628\u062D\u062B \u0639\u0646\u0647\u0627\u061F")} /></label><select value={kind} onChange={e => setKind(e.target.value)} aria-label={t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0633\u0627\u062D\u0629")}><option value="">{t("\u0643\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</option>{Object.entries(kinds).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}</select><Button asChild variant="outline"><Link to="/host"><Plus />{t("\u0623\u0636\u0641 \u0645\u0633\u0627\u062D\u062A\u0643")}</Link></Button></div></div></section><section className="section-wrap spaces-results"><div className="section-heading"><h2>{t("\u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</h2><Button asChild variant="link"><Link to="/bookings">{t("\u062D\u062C\u0648\u0632\u0627\u062A\u064A")}<ArrowUpLeft /></Link></Button></div><div className="spaces-grid">{spaces.filter(s => (!kind || s.kind === kind) && `${s.title} ${s.city}`.includes(search)).map(s => <Link key={s.id} to="/spaces/$id" params={{
          id: s.id
        }} className="space-card"><SpaceImage path={s.photos[0]} /><div className="space-body"><span className="section-kicker">{t(kinds[s.kind]??s.kind)}</span><h2>{s.title}</h2><p><MapPin size={15} />{s.city}<span><Users size={15} />{s.capacity}{t("\u0623\u0634\u062E\u0627\u0635")}</span></p><div className="space-price"><strong>{money(s.hourly_price)}<small>{t("/ \u0633\u0627\u0639\u0629")}</small></strong><ArrowUpLeft size={22} /></div><span className="daily-price">{money(s.daily_price)}{t("/ \u064A\u0648\u0645")}</span></div></Link>)}</div>{!spaces.length && <div className="empty-space"><img src={studio} width={1024} height={768} loading="lazy" alt={t("\u0635\u0648\u0631\u0629 \u062A\u0648\u0636\u064A\u062D\u064A\u0629 \u0644\u0645\u0633\u0627\u062D\u0629 \u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A")} /><div><span className="section-kicker">{t("\u0643\u0646 \u0623\u0648\u0644 \u0627\u0644\u0645\u0636\u064A\u0641\u064A\u0646")}</span><h2>{t("\u0645\u0633\u0627\u062D\u062A\u0643\u060C \u0641\u0631\u0635\u0629 \u062C\u062F\u064A\u062F\u0629.")}</h2><p>{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0633\u0627\u062D\u0627\u062A \u0645\u0646\u0634\u0648\u0631\u0629 \u0628\u0639\u062F.")}<br />{t("\u0623\u0636\u0641 \u0645\u0643\u0627\u0646\u0643 \u0648\u062D\u062F\u062F \u0623\u0633\u0639\u0627\u0631\u0647 \u0648\u0623\u0648\u0642\u0627\u062A\u0647 \u0627\u0644\u0645\u062A\u0627\u062D\u0629.")}</p><Button asChild><Link to="/host">{t("\u0623\u0636\u0641 \u0623\u0648\u0644 \u0645\u0633\u0627\u062D\u0629")}<ArrowUpLeft /></Link></Button><small>{t("\u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0648\u0636\u064A\u062D\u064A\u0629 \u0648\u0644\u064A\u0633\u062A \u0645\u0643\u0627\u0646\u064B\u0627 \u0645\u0639\u0631\u0648\u0636\u064B\u0627 \u0644\u0644\u062D\u062C\u0632.")}</small></div></div>}{spaces.length > 0 && spaces.filter(s => (!kind || s.kind === kind) && `${s.title} ${s.city}`.includes(search)).length === 0 && <div className="empty-state">{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629.")}</div>}<p className="platform-separation"><Clock size={17} />{t("\u0647\u0630\u0647 \u0645\u0646\u0635\u0629 \u0645\u0633\u062A\u0642\u0644\u0629\u061B \u0644\u0627 \u062A\u0631\u062A\u0628\u0637 \u062D\u062C\u0648\u0632\u0627\u062A\u0643 \u0628\u0646\u0634\u0627\u0637\u0643 \u0641\u064A \u0627\u0644\u062A\u0639\u0627\u0631\u0641.")}</p></section></main>;
}
