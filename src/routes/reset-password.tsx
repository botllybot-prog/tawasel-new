import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/tobezly/fields';
import { supabase } from '@/integrations/supabase/client';
import { metadata } from '@/lib/tobezly';
export const Route = createFileRoute('/reset-password')({
  head: () => metadata('كلمة مرور جديدة', 'تعيين كلمة مرور جديدة عبر رابط استعادة طوبزلي الآمن.'),
  component: Reset
});
function Reset() {
  const {
    t
  } = useLanguage();
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setValid(window.location.hash.includes('type=recovery'));
  }, []);
  return <main className="auth-page"><form className="auth-panel form-stack" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!valid) return;
      const f = new FormData(e.currentTarget);
      if (f.get('password') !== f.get('confirm')) {
        setMessage(t("\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646"));
        return;
      }
      const {
        error
      } = await supabase.auth.updateUser({
        password: String(f.get('password'))
      });
      setMessage(error ? error.message : t("\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D."));
    }}><h1>{t("\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629")}</h1>{valid ? <><Field label={t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")} name="password" type="password" minLength={8} required /><Field label={t("\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")} name="confirm" type="password" minLength={8} required /><Button type="submit">{t("\u062D\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}</Button></> : <p>{t("\u0627\u0641\u062A\u062D \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u0645\u0646 \u0631\u0627\u0628\u0637 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0628\u0631\u064A\u062F\u0643.")}</p>}<p role="status">{message}</p></form></main>;
}
