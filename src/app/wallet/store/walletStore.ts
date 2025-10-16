import { create } from "zustand";

interface WalletState {
    mnemonic: string | null;
    setMnemonic: (mnemonic: string) => void;
    clearMnemonic: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    mnemonic: null,
    setMnemonic: (mnemonic) => set({ mnemonic }),
    clearMnemonic: () => set({ mnemonic: null }),
}));
