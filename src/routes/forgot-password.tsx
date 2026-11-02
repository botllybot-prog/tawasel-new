import { useLanguage } from '@/components/tobezly/language';
import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/tobezly/fields';
import { supabase } from '@/integrations/supabase/client';
import { metadata } from '@/lib/tobezly';
export const Route = createFileRoute('/forgot-password')({
  head: () => metadata('استعادة الحساب', 'أرسل رابطًا آمنًا لاستعادة كلمة مرور حساب طوبزلي.'),
  component: Forgot
});
function Forgot() {
  const {
    t
  } = useLanguage();
  const [message, setMessage] = useState('');
  return <main className="auth-page"><form className="auth-panel form-stack" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(String(new FormData(e.currentTarget).get('email')), {
        redirectTo: window.location.origin + '/reset-password'
      });
      setMessage(error ? error.message : t("\u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0633\u062C\u0644\u064B\u0627\u060C \u0633\u064A\u0635\u0644\u0643 \u0631\u0627\u0628\u0637 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631."));
    }}><h1>{t("\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}</h1><Field label={t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")} name="email" type="email" required /><Button type="submit">{t("\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0627\u0628\u0637")}</Button><p role="status">{message}</p></form></main>;
}
