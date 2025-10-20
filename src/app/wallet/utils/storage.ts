// src/app/wallet/utils/storage.ts

export interface AccountMetadata {
    index: number;
    address: string;
}

const ACCOUNT_KEY = "walletAccounts";

/** Load all stored account metadata */
export const loadAccountMetadata = (): AccountMetadata[] => {
    const data = localStorage.getItem(ACCOUNT_KEY);
    return data ? JSON.parse(data) : [];
};

/** Save metadata array */
export const saveAccountMetadata = (accounts: AccountMetadata[]) => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
};

/** Add new account metadata */
export const addAccountMetadata = (newAccount: AccountMetadata) => {
    const existing = loadAccountMetadata();
    const updated = [...existing, newAccount];
    saveAccountMetadata(updated);
};

/** Clear all stored accounts */
export const clearAccountMetadata = () => {
    localStorage.removeItem(ACCOUNT_KEY);
};
