import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Network {
    name: string;
    chainId: number;
    rpcUrl: string;
    currency: string;
    explorer: string;
}

interface NetworkState {
    selectedNetwork: Network;
    setNetwork: (network: Network) => void;
}

const defaultNetwork: Network = {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_URL || "",
    currency: "ETH",
    explorer: "https://sepolia.etherscan.io",
};

export const useNetworkStore = create<NetworkState>()(
    persist(
        (set) => ({
            selectedNetwork: defaultNetwork,
            setNetwork: (network) => set({ selectedNetwork: network }),
        }),
        {
            name: "network-storage", // localStorage key
        }
    )
);
