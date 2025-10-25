"use client";
import React, { useState } from "react";
import { createWallet } from "../utils/createWallet";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWalletStore } from "../store/walletStore";

export default function Create() {
    const setMnemonic = useWalletStore((state) => state.setMnemonic);
    const router = useRouter();
    const [showSeedInputs, setShowSeedInputs] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    function handleCreateWallet() {
        const mnemonic = createWallet();

        console.log(
            "Mnemonic is generated using the bip39 library.\n 12 words are selected randomly and from the bip39 wordlist."
        );
        console.log(
            "Each time the mnemonic generated is unique for each user.\n The probability of two people generating the exact same BIP39 mnemonic phrase is astronomically low."
        );
        console.log(
            "For a 12-word mnemonic, the number of possible combinations is approximately about 5.44×10^39 possible phrases."
        );
        console.log(
            "This number is vastly larger than the estimated number of stars in the observable universe, making the chance of a collision effectively zero for practical purposes."
        );

        // Store in global state
        setMnemonic(mnemonic);

        // Navigate to preview
        router.push("/wallet/create/mnemonic-preview");
    }

    function handleImportSeedPhrase() {
        router.push("/wallet/import");
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content Box */}
            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-gray-700/50 max-w-3xl w-11/12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 drop-shadow-lg">
                    Create or Import{" "}
                    <span className="block text-purple-400">Your Wallet</span>
                </h1>

                {/* Create Wallet */}
                <div className="flex flex-col items-center gap-8 mb-10">
                    <button
                        className="w-80 text-white text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={handleCreateWallet}
                    >
                        Create New Wallet
                    </button>

                    {/* Import Seed Phrase Button */}
                    <motion.button
                        onClick={() => {
                            handleImportSeedPhrase();
                        }}
                        className="w-80 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                        whileTap={{ scale: 0.97 }}
                    >
                        Import Seed Phrase
                    </motion.button>

                    {/* Import Private Key Button */}
                    <motion.button
                        onClick={() => {
                            setShowPrivateKey(!showPrivateKey);
                            setShowSeedInputs(false);
                        }}
                        className="w-80 bg-gradient-to-r from-red-600 to-rose-700 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                        whileTap={{ scale: 0.97 }}
                    >
                        Import Private Key
                    </motion.button>

                    {/* Private Key Drawer*/}
                    <AnimatePresence>
                        {showPrivateKey && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeInOut",
                                }}
                                className="overflow-hidden mt-6"
                            >
                                <div className="bg-gray-800 border border-red-500/40 rounded-2xl p-6">
                                    <p className="text-red-400 font-semibold mb-4 text-sm">
                                        ⚠️{" "}
                                        <span className="text-red-300">
                                            Advanced Feature:{" "}
                                        </span>
                                        Importing a private key gives full
                                        control of your wallet. Only use this if
                                        you understand the risks and trust your
                                        environment.
                                    </p>

                                    <input
                                        type="text"
                                        placeholder="Enter your private key"
                                        className="w-full text-center bg-gray-900 text-white py-3 rounded-xl border border-gray-700 focus:border-red-400 outline-none focus:ring-2 focus:ring-red-400/50 transition"
                                    />

                                    <button className="mt-6 w-full text-white text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-700 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                                        Import Wallet
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
