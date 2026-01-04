import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [msg, setMsg] = useState('Procesando inicio de sesión...');

  useEffect(() => {
    const run = async () => {
      // 1) Si ya hay sesión, adentro
      const existing = await supabase.auth.getSession();
      if (existing.data.session) {
        window.location.href = '/dashboard';
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      // 2) PKCE: viene con ?code=
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('exchangeCodeForSession error:', error);
          setMsg('Error autenticando. Volvé a intentar desde el login.');
          setTimeout(() => (window.location.href = '/'), 1200);
          return;
        }
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
      }

      // 3) Si el flujo fue por hash (#access_token), detectSessionInUrl lo toma solo.
      // Confirmamos sesión:
      const after = await supabase.auth.getSession();
      if (!after.data.session) {
        console.error('No session after callback. URL:', window.location.href);
        setMsg('No se pudo crear la sesión. Volvé a intentar desde el login.');
        setTimeout(() => (window.location.href = '/'), 1200);
        return;
      }

      window.location.href = '/dashboard';
    };

    run();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h1>Mis Gastos IA</h1>
      <p>{msg}</p>
    </div>
  );
}
