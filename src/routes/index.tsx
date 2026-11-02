import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpLeft, Heart, ShieldCheck, LockKeyhole, UserRound, Compass, Leaf, BookOpen, Music, Camera, Mountain, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import cafe from '@/assets/tobezly-cafe.jpg';
import studio from '@/assets/meeting-studio.jpg';
import { metadata } from '@/lib/tobezly';
export const Route = createFileRoute('/')({
  head: () => metadata('التعارف بطريقتك', 'طوبزلي للتعارف بين البالغين باهتمامات مشتركة وخصوصية، ومنصة مستقلة لتأجير المساحات.'),
  component: Home
});
function Home() {
  const {
    t
  } = useLanguage();
  return <><section className="home-hero"><img src={cafe} alt={t("\u062D\u062F\u064A\u062B \u0648\u062F\u064A \u0641\u064A \u0645\u0642\u0647\u0649 \u0645\u0641\u062A\u0648\u062D")} width={1920} height={1024} className="hero-image" /><div className="hero-shade" /><div className="hero-inner"><div className="hero-copy"><span className="eyebrow"><span />{t("\u0628\u062F\u0627\u064A\u0627\u062A \u062D\u0642\u064A\u0642\u064A\u0629\u060C \u0639\u0644\u0649 \u0637\u0631\u064A\u0642\u062A\u0643")}</span><h1>{t("\u0637\u0648\u0628\u0632\u0644\u064A.")}<br />{t("\u0644\u0645\u0646 \u064A\u0634\u0628\u0647\u0643.")}</h1><p>{t("\u0627\u0644\u062A\u0642\u0650 \u0628\u0645\u0646 \u064A\u0634\u0627\u0631\u0643\u0643 \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0643\u060C")}<br />{t("\u0648\u0627\u062A\u0631\u0643 \u0644\u0644\u062D\u0643\u0627\u064A\u0629 \u0641\u0631\u0635\u0629 \u0623\u0646 \u062A\u0628\u062F\u0623.")}</p><Button asChild size="lg" className="hero-cta"><Link to="/dating">{t("\u0627\u0643\u062A\u0634\u0641 \u0623\u0634\u062E\u0627\u0635\u064B\u0627 \u064A\u0634\u0628\u0647\u0648\u0646\u0643")}<ArrowUpLeft /></Link></Button><div className="hero-note"><ShieldCheck size={17} />{t("\u0623\u0633\u0645\u0627\u0621 \u0645\u0633\u062A\u0639\u0627\u0631\u0629. \u062E\u0635\u0648\u0635\u064A\u0629 \u0623\u0643\u062B\u0631. \u062A\u0648\u0627\u0635\u0644 \u0623\u0635\u062F\u0642.")}</div></div><span className="image-caption">{t("\u0643\u0644 \u062D\u0643\u0627\u064A\u0629 \u062C\u0645\u064A\u0644\u0629\u060C \u062A\u0628\u062F\u0623 \u0628\u062D\u062F\u064A\u062B.")}</span></div></section><section className="trust-strip"><div><ShieldCheck />{t("\u062D\u0633\u0627\u0628\u0627\u062A \u0645\u0648\u062B\u0651\u0642\u0629")}</div><div><LockKeyhole />{t("\u062E\u0635\u0648\u0635\u064A\u062A\u0643 \u0628\u064A\u062F\u0643")}</div><div><UserRound />{t("\u0644\u0644\u0623\u0639\u0645\u0627\u0631 18 \u0633\u0646\u0629 \u0648\u0623\u0643\u062B\u0631")}</div><div><Heart />{t("\u062A\u0648\u0627\u0635\u0644 \u0628\u0625\u0639\u062C\u0627\u0628 \u0645\u062A\u0628\u0627\u062F\u0644")}</div></section><section className="section-wrap discovery-section"><div className="section-heading"><div><span className="section-kicker">{t("\u0623\u0643\u062B\u0631 \u0645\u0646 \u0645\u062C\u0631\u062F \u062A\u0639\u0627\u0631\u0641")}</span><h2>{t("\u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629\u060C \u0628\u062F\u0627\u064A\u0629 \u0623\u0642\u0631\u0628.")}</h2></div><Button asChild variant="link"><Link to="/dating">{t("\u0627\u0643\u062A\u0634\u0641 \u0645\u062C\u062A\u0645\u0639 \u0637\u0648\u0628\u0632\u0644\u064A")}<ArrowUpLeft /></Link></Button></div><div className="interest-grid">{[{
          icon: BookOpen,
          name: t("\u0628\u064A\u0646 \u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0643\u062A\u0628"),
          sub: t("\u0644\u0645\u0646 \u064A\u062C\u062F \u0646\u0641\u0633\u0647 \u0641\u064A \u062D\u0643\u0627\u064A\u0629"),
          topic: 'القراءة'
        }, {
          icon: Mountain,
          name: t("\u0641\u064A \u0631\u062D\u0644\u0629 \u062C\u062F\u064A\u062F\u0629"),
          sub: t("\u0644\u0645\u0646 \u064A\u062D\u0628 \u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0639\u0627\u0644\u0645"),
          topic: 'السفر'
        }, {
          icon: Music,
          name: t("\u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0625\u064A\u0642\u0627\u0639"),
          sub: t("\u0644\u0645\u0646 \u062A\u062C\u0645\u0639\u0647\u0645 \u0627\u0644\u0645\u0648\u0633\u064A\u0642\u0649"),
          topic: 'الموسيقى'
        }, {
          icon: Camera,
          name: t("\u0628\u0639\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u0629"),
          sub: t("\u0644\u0645\u0646 \u064A\u0631\u0649 \u0627\u0644\u062C\u0645\u0627\u0644 \u0641\u064A \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644"),
          topic: 'الفن'
        }].map(({
          icon: Icon,
          name,
          sub,
          topic
        }) => <Link key={name} to="/dating" search={{
          interest: topic
        }} className="interest-tile"><span className="interest-icon"><Icon size={26} /></span><h3>{name}</h3><p>{sub}</p><ArrowUpLeft className="tile-arrow" size={18} /></Link>)}</div></section><section className="rental-band"><div className="section-wrap rental-inner"><div><span className="section-kicker"><Building2 size={15} />{t("\u0639\u0627\u0644\u0645 \u0622\u062E\u0631 \u0645\u0646 \u0637\u0648\u0628\u0632\u0644\u064A")}</span><h2>{t("\u0645\u0633\u0627\u062D\u0629 \u062A\u0646\u0627\u0633\u0628 \u064A\u0648\u0645\u0643.")}</h2><p>{t("\u0645\u0643\u0627\u062A\u0628\u060C \u0627\u0633\u062A\u0648\u062F\u064A\u0648\u0647\u0627\u062A \u0648\u0645\u0633\u0627\u062D\u0627\u062A \u0645\u0631\u0646\u0629\u060C \u0628\u0627\u0644\u0633\u0627\u0639\u0629 \u0623\u0648 \u0628\u0627\u0644\u064A\u0648\u0645.")}<br />{t("\u0645\u0646\u0635\u0629 \u0645\u0633\u062A\u0642\u0644\u0629 \u062A\u0645\u0627\u0645\u064B\u0627 \u0639\u0646 \u0627\u0644\u062A\u0639\u0627\u0631\u0641.")}</p><Button asChild variant="outline"><Link to="/spaces">{t("\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}<ArrowUpLeft /></Link></Button></div><img src={studio} width={1024} height={768} alt={t("\u0645\u0633\u0627\u062D\u0629 \u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0645\u0636\u064A\u0626\u0629")} loading="lazy" /><div className="rental-points"><span><Check />{t("\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u064A\u062D\u062F\u062F\u0647\u0627 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u0643\u0627\u0646")}</span><span><Check />{t("\u0623\u0648\u0642\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u062D\u062C\u0632 \u0645\u0631\u0646")}</span><span><Check />{t("\u0637\u0644\u0628\u0627\u062A \u062D\u062C\u0632 \u0645\u0633\u062A\u0642\u0644\u0629")}</span></div></div></section><section className="section-wrap safety-note"><Leaf size={24} /><div><h3>{t("\u0628\u062F\u0627\u064A\u0627\u062A \u0622\u0645\u0646\u0629\u060C \u0648\u062A\u0648\u0627\u0635\u0644 \u0628\u0627\u062D\u062A\u0631\u0627\u0645.")}</h3><p>{t("\u0635\u0648\u0631 \u062A\u064F\u0631\u0627\u062C\u0639 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631\u060C \u0648\u0625\u0628\u0644\u0627\u063A \u0648\u062D\u0638\u0631 \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629. \u0623\u0646\u062A \u062A\u062E\u062A\u0627\u0631 \u0645\u0627 \u062A\u0634\u0627\u0631\u0643\u0647.")}</p></div><Button asChild variant="ghost"><Link to="/account">{t("\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629")}<ArrowUpLeft /></Link></Button></section></>;
}
