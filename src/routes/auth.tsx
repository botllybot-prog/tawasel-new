import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Heart, ArrowUpLeft, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/tobezly/fields';
import { useSession } from '@/components/tobezly/session';
import { supabase } from '@/integrations/supabase/client';
import { isAdult, metadata } from '@/lib/tobezly';
export const Route = createFileRoute('/auth')({
  head: () => metadata('حسابك', 'إنشاء حساب باسم مستعار مع توثيق البريد الإلكتروني وتأكيد بلوغ 18 عامًا.'),
  component: Auth
});
function Auth() {
  const {
    t
  } = useLanguage();
  const {
    user
  } = useSession();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email'));
    const password = String(f.get('password'));
    const birth = String(f.get('birth'));
    if (signup && (!isAdult(birth) || !f.get('adult'))) {
      setError('يجب أن يكون عمرك 18 سنة أو أكثر.');
      return;
    }
    setBusy(true);
    const result = signup ? await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nickname: String(f.get('nickname')),
          birth_date: birth
        }
      }
    }) : await supabase.auth.signInWithPassword({
      email,
      password
    });
    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (signup && !result.data.session) setMessage('أرسلنا رابط تأكيد إلى بريدك. افتحه لتوثيق حسابك ثم سجّل الدخول.');else navigate({
      to: '/account'
    });
  }
  return <main className="auth-page"><div className="auth-panel"><span className="auth-icon"><Heart /></span><span className="section-kicker">{t("\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0637\u0648\u0628\u0632\u0644\u064A")}</span><h1>{user ? t("\u062D\u0633\u0627\u0628\u0643 \u062C\u0627\u0647\u0632") : signup ? t("\u0643\u0644 \u062D\u0643\u0627\u064A\u0629 \u0644\u0647\u0627 \u0628\u062F\u0627\u064A\u0629.") : t("\u062C\u0645\u064A\u0644 \u0623\u0646 \u0646\u0631\u0627\u0643 \u0645\u062C\u062F\u062F\u064B\u0627.")}</h1>{user ? <Button asChild><Link to="/account">{t("\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643")}<ArrowUpLeft /></Link></Button> : <><div className="segmented"><Button variant={!signup ? 'default' : 'ghost'} onClick={() => {
            setSignup(false);
            setError('');
          }}>{t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644")}</Button><Button variant={signup ? 'default' : 'ghost'} onClick={() => {
            setSignup(true);
            setError('');
          }}>{t("\u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F")}</Button></div><form onSubmit={submit} className="form-stack">{signup && <><Field label={t("\u0627\u0633\u0645\u0643 \u0627\u0644\u0645\u0633\u062A\u0639\u0627\u0631")} name="nickname" required minLength={2} maxLength={40} /><Field label={t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F (\u0644\u0646 \u064A\u0638\u0647\u0631 \u0644\u0644\u0622\u062E\u0631\u064A\u0646)")} name="birth" type="date" required /></>}<Field label={t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")} name="email" type="email" required dir="ltr" /><Field label={t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")} name="password" type="password" required minLength={8} dir="ltr" />{signup && <label className="check-label"><input type="checkbox" name="adult" required />{t("\u0623\u0624\u0643\u062F \u0623\u0646 \u0639\u0645\u0631\u064A 18 \u0633\u0646\u0629 \u0623\u0648 \u0623\u0643\u062B\u0631 \u0648\u0623\u0644\u062A\u0632\u0645 \u0628\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0645\u062D\u062A\u0631\u0645 \u0648\u0645\u0646\u0639 \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0639\u0627\u0631\u064A\u0629.")}</label>}{error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="form-success"><Mail size={20} />{message}</p>}<Button disabled={busy} type="submit" size="lg">{busy ? t("\u062C\u0627\u0631\u064D \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629\u2026") : signup ? t("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0628\u0631\u064A\u062F") : t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644")}<ArrowUpLeft /></Button></form><Button asChild variant="link"><Link to="/forgot-password">{t("\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F")}</Link></Button><p className="auth-safe"><ShieldCheck size={16} />{t("\u0628\u0631\u064A\u062F\u0643 \u0648\u062A\u0627\u0631\u064A\u062E \u0645\u064A\u0644\u0627\u062F\u0643 \u0644\u0627 \u064A\u0638\u0647\u0631\u0627\u0646 \u0644\u0644\u0622\u062E\u0631\u064A\u0646.")}</p></>}</div></main>;
}
