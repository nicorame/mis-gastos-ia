import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AccountsPanel from './AccountsPanel';

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = '/';
        return;
      }
      setEmail(data.session.user.email ?? null);
    };

    run();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!email) return <p>Cargando...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: 16 }}>
      <h1>Mis gastos</h1>
      <AccountsPanel />
      <p>Estás logueado como: {email}</p>
      <button onClick={logout} style={{ padding: 8 }}>
        Cerrar sesión
      </button>
    </div>
  );
}
