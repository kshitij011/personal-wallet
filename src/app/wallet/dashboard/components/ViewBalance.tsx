"use client";
import { useEffect, useState, useCallback } from "react";
import { useNetworkStore } from "@/app/wallet/store/networkStore";
import { RotateCw } from "lucide-react";

interface ViewBalanceProps {
    account: string;
}

export default function ViewBalance({ account }: ViewBalanceProps) {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { selectedNetwork } = useNetworkStore();

    const refreshBalance = useCallback(async () => {
        if (!account) return;
        setLoading(true);
        try {
            const body = {
                jsonrpc: "2.0",
                method: "eth_getBalance",
                params: [account, "latest"],
                id: 1,
            };

            const res = await fetch(selectedNetwork.rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.result) {
                const wei = BigInt(data.result);
                const eth = Number(wei) / 1e18;
                setBalance(eth.toFixed(6));
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        } finally {
            setLoading(false);
        }
    }, [account, selectedNetwork]);

    useEffect(() => {
        refreshBalance();
    }, [refreshBalance, selectedNetwork]);

    return (
        <div className="flex items-center gap-3 bg-gray-700/40 px-4 py-3 rounded-xl border border-gray-600">
            <div className="flex flex-col text-left">
                <span className="text-purple-300 text-sm font-medium">
                    Balance
                </span>
                <span className="text-gray-200 text-lg font-semibold">
                    {loading
                        ? "..."
                        : balance
                        ? `${balance} ETH`
                        : "0.000000 ETH"}
                </span>
            </div>
            <button
                onClick={refreshBalance}
                className={`p-2 rounded-full hover:bg-gray-600 transition ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Refresh Balance"
            >
                <RotateCw
                    size={18}
                    className={`text-purple-400 ${
                        loading ? "animate-spin" : ""
                    }`}
                />
            </button>
        </div>
    );
}
