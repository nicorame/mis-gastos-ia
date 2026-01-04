import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Te enviamos un link a tu email');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: 'auto' }}>
      <h1>Mis Gastos IA</h1>

      <input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />

      <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
        {loading ? 'Enviando...' : 'Ingresar'}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}