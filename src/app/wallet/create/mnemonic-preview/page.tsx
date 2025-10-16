"use client";
import { useRouter } from "next/navigation";
import { useWalletStore } from "../../store/walletStore";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function MnemonicPreview() {
    const router = useRouter();
    const mnemonic = useWalletStore((state) => state.mnemonic);

    useEffect(() => {
        if (!mnemonic) {
            alert("No mnemonic found, redirecting to create wallet.");
            router.push("/wallet/create");
        }
    }, [mnemonic, router]);

    // if (!mnemonic) return null;

    const words = mnemonic ? mnemonic.split(" ") : [];

    const handleContinue = () => {
        router.push("/wallet/create/mnemonic-preview/set-password");
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden px-4">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content Box */}
            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 max-w-3xl w-full">
                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
                    Your Secret Recovery Phrase
                </h1>

                {/* Warning */}
                <div className="bg-red-900/40 border border-red-600/40 text-red-200 rounded-2xl p-4 mb-8 text-sm md:text-base font-medium">
                    ⚠️{" "}
                    <span className="font-semibold text-red-300">
                        Important:
                    </span>
                    &nbsp;This phrase is the{" "}
                    <span className="text-white">only way</span> to recover your
                    wallet. Never share it with anyone. If you lose it, even we{" "}
                    <span className="text-white font-bold">
                        cannot recover your funds.
                    </span>
                </div>

                {/* Mnemonic Words Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
                    {words.map((word, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-800 text-white py-3 px-4 rounded-xl border border-gray-600 shadow-md hover:border-purple-500 transition-all duration-200"
                        >
                            <span className="text-gray-400 text-xs block">
                                {index + 1}
                            </span>
                            <span className="text-lg font-semibold">
                                {word}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Continue Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleContinue}
                    className="w-72 bg-gradient-to-r from-green-500 to-emerald-700 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-green-700/30 transition-transform duration-300 cursor-pointer"
                >
                    Continue
                </motion.button>
            </div>
        </main>
    );
}
