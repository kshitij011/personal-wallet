"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWalletStore } from "../../../store/walletStore";
import {
    deriveKeyFromPassword,
    encryptMnemonic,
} from "@/app/wallet/utils/encrypt";
// import { webcrypto } from "crypto";

export default function SetPassword() {
    const router = useRouter();
    const mnemonic = useWalletStore((state) => state.mnemonic);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!mnemonic) {
            alert("No mnemonic found, redirecting to create wallet.");
            router.push("/wallet/create");
        }
    }, [mnemonic, router]);

    async function handleSetPassword() {
        if (!password || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 5) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (localStorage.getItem("wallet_encrypted")) {
            setError("A wallet already exists in local storage.");
            return;
        }

        const { derivedKey, salt } = await deriveKeyFromPassword(password);
        const encryptedMnemonic = await encryptMnemonic(mnemonic!, derivedKey);

        localStorage.setItem(
            "wallet_encrypted",
            JSON.stringify({
                ciphertext: encryptedMnemonic.ciphertext,
                iv: encryptedMnemonic.iv,
                salt: btoa(String.fromCharCode(...salt)),
            })
        );

        console.log(
            "Your mnemonic is encrypted using the AES-GCM with the password's generated key you provide."
        );
        console.log(
            "Most wallets use PBKDF2 for strong key generation from your password because the plain texts are easier to crack."
        );
        console.log(
            "PBKDF2 work by hashing your password with a salt value to prevent against rainbow table attacks. This encrypted mnemonic (cipher text) and password's hash and salt is stored in browser storage."
        );

        console.log("Encrypted mnemonic: ", encryptedMnemonic.ciphertext);
        console.log("Derived key: ", derivedKey);
        console.log("Salt used: ", salt);

        // After encryption success
        router.push("/wallet/dashboard");
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden px-4">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content Box */}
            <div className="relative z-10 bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 max-w-md w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
                    Set Your Password
                </h1>

                {/* Warning */}
                <div className="bg-yellow-900/40 border border-yellow-600/40 text-yellow-200 rounded-2xl p-4 mb-8 text-sm md:text-base font-medium">
                    🔒{" "}
                    <span className="font-semibold text-yellow-300">
                        Keep this password safe!
                    </span>
                    &nbsp;It encrypts your wallet and is required to unlock it
                    later. If you forget it, your wallet{" "}
                    <span className="text-white font-bold">
                        cannot be recovered.
                    </span>
                </div>

                {/* Inputs */}
                <div className="flex flex-col gap-5 mb-6">
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-center bg-gray-800 text-white py-4 rounded-xl border border-gray-600 focus:border-purple-400 outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    />
                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Continue Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSetPassword}
                    className="w-72 bg-gradient-to-r from-green-500 to-emerald-700 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-green-700/30 transition-transform duration-300 cursor-pointer"
                >
                    Continue
                </motion.button>
            </div>
        </main>
    );
}
