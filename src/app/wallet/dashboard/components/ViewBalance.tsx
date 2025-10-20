"use client";
import { useEffect, useState, useCallback } from "react";

interface ViewBalanceProps {
    account: string;
}

export default function ViewBalance({ account }: ViewBalanceProps) {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

            const res = await fetch(
                process.env.NEXT_PUBLIC_ALCHEMY_URL
                    ? process.env.NEXT_PUBLIC_ALCHEMY_URL
                    : "",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

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
    }, [account]);

    useEffect(() => {
        refreshBalance();
    }, [refreshBalance]);

    return (
        <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 my-6">
            <h3 className="text-2xl font-semibold text-purple-300 mb-2">
                Balance
            </h3>
            <p className="text-gray-300 text-lg">
                {loading
                    ? "Fetching..."
                    : balance
                    ? `${balance} ETH`
                    : "Unable to load balance"}
            </p>
            <button
                onClick={refreshBalance}
                className="mt-4 bg-gradient-to-r from-purple-500 to-blue-600 px-5 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-transform cursor-pointer"
            >
                Refresh
            </button>
        </div>
    );
}
