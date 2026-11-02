import { useLanguage } from '@/components/tobezly/language';
import { Link, useRouterState } from '@tanstack/react-router';
import { Heart, Building2, ShieldCheck, ArrowUpLeft, LogOut, UserRound, Menu } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './session';
import {Notifications} from './notifications';
import {MessageNotifications} from './message-notifications';
export function Header() {
  const {
    t, language, setLanguage
  } = useLanguage();
  const {
    user
  } = useSession();
  const qc = useQueryClient();
  const path = useRouterState({
    select: s => s.location.pathname
  });
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner"><Link to="/" className="wordmark"><span className="logo-mark"><Heart size={23} strokeWidth={2.3} /></span><span>{t("\u062A\u0648\u0627\u0635\u0644")}<small>TAWASEL</small></span></Link><MessageNotifications/><nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label={t("\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629")}><Link to="/" activeOptions={{
          exact: true
        }} className={path === '/' || path === '/dating' ? 'nav-item active' : 'nav-item'}><Heart size={17} />{t("\u0627\u0644\u062A\u0639\u0627\u0631\u0641")}</Link><Link to="/spaces" className={path.startsWith('/spaces') ? 'nav-item active' : 'nav-item'}><Building2 size={17} />{t("\u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A")}</Link><Link to="/host" className="nav-item">{t("\u0623\u0636\u0641 \u0645\u0633\u0627\u062D\u062A\u0643")}<ArrowUpLeft size={15} /></Link></nav><div className="header-actions"><Notifications/><select className="language-select" aria-label="اللغة / Language" value={language} onChange={e=>setLanguage(e.target.value as 'ar'|'en'|'ku')}><option value="ar">العربية</option><option value="en">English</option><option value="ku">کوردی</option></select>{user ? <><Button asChild variant="ghost"><Link to="/account"><UserRound />{t("\u062D\u0633\u0627\u0628\u064A")}</Link></Button><Button variant="ghost" size="icon" aria-label={t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C")} title={t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C")} onClick={async () => {
            await qc.cancelQueries();
            qc.clear();
            await supabase.auth.signOut();
          }}><LogOut /></Button></> : <><Button asChild variant="ghost" className="login-link"><Link to="/auth">{t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644")}</Link></Button><Button asChild><Link to="/auth">{t("\u0627\u0646\u0636\u0645 \u0627\u0644\u0622\u0646")}<ArrowUpLeft /></Link></Button></>}<Button variant="ghost" size="icon" className="mobile-menu" aria-label={t("\u0641\u062A\u062D \u0627\u0644\u0642\u0627\u0626\u0645\u0629")} onClick={() => setOpen(!open)}><Menu /></Button></div></div></header>;
}
export function Footer() {
  const {
    t
  } = useLanguage();
  return <footer className="site-footer"><div className="footer-inner"><Link to="/" className="footer-logo">{t("\u062A\u0648\u0627\u0635\u0644")}<span>TAWASEL</span></Link><p>{t("\u062A\u0648\u0627\u0635\u0644 \u062D\u0642\u064A\u0642\u064A. \u0645\u0633\u0627\u062D\u0627\u062A \u062A\u0644\u0647\u0645\u0643.")}</p><Link to="/admin" className="admin-link">{t("لوحة الإدارة")}</Link><span className="footer-safe"><ShieldCheck size={16} />{t("\u062E\u0635\u0648\u0635\u064A\u062A\u0643 \u0623\u0648\u0644\u0627\u064B \xB7 \u0644\u0644\u0628\u0627\u0644\u063A\u064A\u0646 +18")}</span><span>{t("\xA9 2026 \u062A\u0648\u0627\u0635\u0644")}</span></div></footer>;
}
export function SignInNotice({
  text = 'سجّل الدخول للمتابعة'
}: {
  text?: string;
}) {
  const {
    t
  } = useLanguage();
  return <div className="empty-state"><ShieldCheck size={36} /><h2>{text}</h2><Button asChild><Link to="/auth">{t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644")}<ArrowUpLeft /></Link></Button></div>;
}
