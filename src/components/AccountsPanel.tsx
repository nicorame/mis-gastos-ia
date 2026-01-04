import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Account, AccountType } from '../types/db';
import { formatARS, toCents } from '../lib/money';

export default function AccountsPanel() {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('wallet');
    const [initialBalance, setInitialBalance] = useState('0');

    const totalCents = useMemo(() => {
        return accounts.reduce((sum, a) => sum + (a.initial_balance ?? 0), 0);
    }, [accounts]);

    const loadAccounts = async () => {
        setError(null);
        setLoading(true);

        const sessionRes = await supabase.auth.getSession();
        const session = sessionRes.data.session;
        if (!session) {
            window.location.href = '/';
            return;
        }

        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) setError(error.message);
        setAccounts((data ?? []) as Account[]);
        setLoading(false);
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const sessionRes = await supabase.auth.getSession();
        const session = sessionRes.data.session;
        if (!session) {
            window.location.href = '/';
            return;
        }

        const cents = toCents(initialBalance);

        const { error } = await supabase.from('accounts').insert({
            user_id: session.user.id,
            name: name.trim(),
            type,
            currency: 'ARS',
            initial_balance: cents,
        });

        if (error) {
            setError(error.message);
            return;
        }

        setName('');
        setType('wallet');
        setInitialBalance('0');
        await loadAccounts();
    };

    return (
        <div style={{ marginTop: 16 }}>
            <h2>Cuentas</h2>

            <div style={{ margin: '8px 0', padding: 12, border: '1px solid #333', borderRadius: 8 }}>
                <strong>Saldo total inicial:</strong> {formatARS(totalCents)}
            </div>

            <form onSubmit={createAccount} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre (Ej: Efectivo, Mercado Pago, BBVA)"
                    required
                    style={{ padding: 8 }}
                />

                <select value={type} onChange={(e) => setType(e.target.value as AccountType)} style={{ padding: 8 }}>
                    <option value="cash">Efectivo</option>
                    <option value="wallet">Billetera</option>
                    <option value="bank">Banco</option>
                </select>

                <input
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="Saldo inicial (Ej: 15000, 15.000,50)"
                    style={{ padding: 8 }}
                />

                <button type="submit" style={{ padding: 10 }}>
                    Crear cuenta
                </button>

                {error && <p style={{ color: 'crimson' }}>{error}</p>}
            </form>

            <hr style={{ margin: '16px 0' }} />

            {loading ? (
                <p>Cargando cuentas...</p>
            ) : accounts.length === 0 ? (
                <p>No hay cuentas todavía. Creá tu primera cuenta.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                    {accounts.map((a) => (
                        <li key={a.id} style={{ padding: 12, border: '1px solid #333', borderRadius: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <strong>{a.name}</strong> <span style={{ opacity: 0.75 }}>({a.type})</span>
                                </div>
                                <div>{formatARS(a.initial_balance)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
