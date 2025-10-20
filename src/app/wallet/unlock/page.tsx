"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWalletStore } from "@/app/wallet/store/walletStore";
import { decryptMnemonic } from "@/app/wallet/utils/decrypt"; // assuming you moved decryption logic here

export default function Unlock() {
    const router = useRouter();
    const setMnemonic = useWalletStore((state) => state.setMnemonic);

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const vault = localStorage.getItem("wallet_encrypted");

            if (vault) {
                router.replace("/wallet/unlock");
            } else {
                router.replace("/wallet/create");
            }
        } catch (error) {
            console.error("Storage check failed: ", error);
        }
    });

    const handleUnlock = async () => {
        setError("");
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            const mnemonic = await decryptMnemonic(password);
            if (!mnemonic) throw new Error("Failed to decrypt");

            // Save decrypted mnemonic in store
            setMnemonic(mnemonic);

            // Redirect to dashboard
            router.push("/wallet/dashboard");
        } catch (err) {
            console.error("Decryption failed:", err);
            setError("Incorrect password. Please try again.");
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden px-4">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content Box */}
            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 max-w-md w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
                    Unlock Wallet
                </h1>

                {/* Warning */}
                <div className="bg-yellow-900/40 border border-yellow-600/40 text-yellow-200 rounded-2xl p-4 mb-8 text-sm md:text-base font-medium">
                    🔒 Enter your password to decrypt your wallet. Make sure
                    it’s the password you set during wallet creation.
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-5 mb-6">
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-center bg-gray-800 text-white py-4 rounded-xl border border-gray-600 focus:border-purple-400 outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mb-4"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Unlock Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUnlock}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-700 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-green-700/30 transition-transform duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                    <span>🔓 Unlock</span>
                </motion.button>
            </div>
        </main>
    );
}
