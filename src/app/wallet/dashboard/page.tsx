"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWalletStore } from "@/app/wallet/store/walletStore";
import ViewBalance from "./components/ViewBalance";
import {
    deriveAccounts,
    DerivedAccount,
} from "@/app/wallet/utils/deriveAccounts";
import {
    loadAccountMetadata,
    addAccountMetadata,
} from "@/app/wallet/utils/storage";
import SelectAccount from "./components/SelectAccount";
import SendTransaction from "./components/SendTransaction";

export default function Dashboard() {
    const router = useRouter();
    const mnemonic = useWalletStore((state) => state.mnemonic);

    const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!mnemonic) {
                console.warn("No mnemonic found, redirecting to unlock page.");
                router.push("/wallet/unlock");
                return;
            }

            const stored = loadAccountMetadata();
            if (stored.length === 0) {
                setLoading(false);
                return;
            }

            const indexes = stored.map((a) => a.index);
            const derived = await deriveAccounts(mnemonic, indexes);
            setAccounts(derived);
            setLoading(false);
        };

        init();
    }, [mnemonic, router]);

    const handleCreateAccount = async () => {
        if (!mnemonic) return;
        const stored = loadAccountMetadata();
        const nextIndex = stored.length;
        const derived = await deriveAccounts(mnemonic, [nextIndex]);
        const newAccount = derived[0];

        addAccountMetadata({ index: nextIndex, address: newAccount.address });
        setAccounts((prev) => [...prev, newAccount]);
        setSelectedAccount(nextIndex);
    };

    if (loading)
        return (
            <main className="min-h-screen flex items-center justify-center text-white">
                <p>Loading your wallet...</p>
            </main>
        );

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glowing Background */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-gray-700/50 max-w-4xl w-full text-center">
                <h1 className="text-4xl font-extrabold mb-8">
                    Your Wallet Dashboard
                </h1>

                {accounts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <p className="text-gray-300 text-lg mb-6">
                            No accounts found in this wallet.
                        </p>
                        <button
                            onClick={handleCreateAccount}
                            className="bg-gradient-to-r from-purple-500 to-blue-600 px-8 py-4 rounded-2xl font-semibold text-xl shadow-lg hover:scale-105 transition-transform duration-300"
                        >
                            + Create First Account
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <SelectAccount
                            accounts={accounts}
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                            handleCreateAccount={handleCreateAccount}
                        />

                        {/* Display Selected Account */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/70 p-6 rounded-2xl border border-gray-700"
                        >
                            <h2 className="text-xl font-semibold text-purple-300 mb-2">
                                Account {selectedAccount + 1}
                            </h2>
                            <p className="text-gray-400 break-all">
                                {accounts[selectedAccount].address}
                            </p>
                        </motion.div>

                        <ViewBalance
                            account={accounts[selectedAccount].address}
                        />
                        <SendTransaction
                            account={accounts[selectedAccount]}
                            onTxSuccess={() =>
                                console.log(
                                    "Transaction success — refresh balance here"
                                )
                            }
                        />
                    </>
                )}
            </div>
        </main>
    );
}
