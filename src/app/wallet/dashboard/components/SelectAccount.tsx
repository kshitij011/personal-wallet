"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectAccountProps {
    accounts: { address: string }[];
    selectedAccount: number;
    setSelectedAccount: (index: number) => void;
    handleCreateAccount: () => void;
}

export default function SelectAccount({
    accounts,
    selectedAccount,
    setSelectedAccount,
    handleCreateAccount,
}: SelectAccountProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".dropdown-container")) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="dropdown-container inline-flex flex-col items-center w-64 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative inline-block text-left w-full"
            >
                {/* Dropdown Trigger */}
                <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="w-full flex justify-between items-center bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold shadow-md hover:border-purple-500 transition-all"
                >
                    <span>
                        Account {selectedAccount + 1}{" "}
                        <span className="text-gray-400 text-sm">
                            ({accounts[selectedAccount].address.slice(0, 10)}…)
                        </span>
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            dropdownOpen ? "rotate-180 text-purple-400" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[110%] bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl w-full z-50 flex flex-col"
                        >
                            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                                {accounts.map((acc, i) => (
                                    <button
                                        key={acc.address}
                                        onClick={() => {
                                            setSelectedAccount(i);
                                            setDropdownOpen(false);
                                        }}
                                        className={`text-left px-5 py-3 hover:bg-gray-800 border-b border-gray-800 transition-colors ${
                                            selectedAccount === i
                                                ? "text-purple-400"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        <span className="font-semibold">
                                            Account {i + 1}
                                        </span>
                                        <p className="text-xs text-gray-500 truncate">
                                            {acc.address}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* Add Account Option */}
                            <button
                                onClick={() => {
                                    handleCreateAccount();
                                    setDropdownOpen(false);
                                }}
                                className="w-full text-left px-5 py-3 text-green-400 font-semibold hover:bg-green-900/30 rounded-b-xl transition-colors"
                            >
                                + Add New Account
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
