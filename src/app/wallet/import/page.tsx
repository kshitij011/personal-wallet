"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWalletStore } from "../store/walletStore";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export default function ImportWallet() {
    const router = useRouter();
    const setMnemonic = useWalletStore((state) => state.setMnemonic);

    const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
    const [error, setError] = useState("");

    // ✅ Update specific word input
    const handleWordChange = (index: number, value: string) => {
        const updatedWords = [...mnemonicWords];
        updatedWords[index] = value.trim().toLowerCase();
        setMnemonicWords(updatedWords);
    };

    // ✅ Import logic
    const handleImport = async () => {
        setError("");

        const words = mnemonicWords
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean);

        // Check if all 12 words filled
        if (words.length !== 12) {
            setError("Please enter all 12 words before continuing.");
            return;
        }

        // Check each word against BIP39 list
        const invalidWord = words.find((word) => !wordlist.includes(word));
        if (invalidWord) {
            setError(`Invalid word: "${invalidWord}" (not in BIP39 wordlist)`);
            return;
        }

        // Validate mnemonic structure
        const mnemonic = words.join(" ");
        if (!validateMnemonic(mnemonic, wordlist)) {
            setError("Invalid mnemonic — please check the word order.");
            return;
        }

        // ✅ Success: Store mnemonic and continue
        setMnemonic(mnemonic);
        router.push("/wallet/create/mnemonic-preview/set-password");
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden px-4">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content Box */}
            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 max-w-3xl w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
                    Import Wallet
                </h1>

                {/* Info Box */}
                <div className="bg-yellow-900/40 border border-yellow-600/40 text-yellow-200 rounded-2xl p-4 mb-8 text-sm md:text-base font-medium">
                    🔑 Enter your{" "}
                    <span className="text-yellow-300 font-semibold">
                        12-word recovery phrase
                    </span>{" "}
                    below in the correct order.
                </div>

                {/* 12 Input Boxes */}
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden mt-6"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mnemonicWords.map((word, i) => (
                            <div
                                key={i}
                                className="relative"
                            >
                                <span className="absolute left-2 top-2 text-xs text-gray-500">
                                    {i + 1}
                                </span>
                                <input
                                    type="text"
                                    value={word}
                                    placeholder={`Word ${i + 1}`}
                                    onChange={(e) =>
                                        handleWordChange(i, e.target.value)
                                    }
                                    className="w-full text-center bg-gray-800 text-white py-3 rounded-xl border border-gray-600 focus:border-purple-400 outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm mt-4"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Import Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleImport}
                        className="mt-8 w-72 bg-gradient-to-r from-green-500 to-emerald-700 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-green-700/30 transition-transform duration-300 cursor-pointer"
                    >
                        Import Wallet
                    </motion.button>
                </motion.div>
            </div>
        </main>
    );
}
