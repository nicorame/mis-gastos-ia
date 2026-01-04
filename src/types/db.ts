export type AccountType = 'cash' | 'wallet' | 'bank';

export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    currency: string;
    initial_balance: number;
    created_at: string;
};
