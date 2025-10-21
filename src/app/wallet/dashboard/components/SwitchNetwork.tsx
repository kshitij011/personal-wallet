"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkStore } from "@/app/wallet/store/networkStore";

export default function SwitchNetwork() {
    const { selectedNetwork, setNetwork } = useNetworkStore();
    const [current, setCurrent] = useState(selectedNetwork.chainId);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const networks = [
        {
            name: "Sepolia Testnet",
            chainId: 11155111,
            rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_URL || "",
            currency: "ETH",
            explorer: "https://sepolia.etherscan.io",
        },
        {
            name: "Polygon Testnet (Amoy)",
            chainId: 80002,
            rpcUrl: process.env.NEXT_PUBLIC_POLYGON_URL || "",
            currency: "MATIC",
            explorer: "https://amoy.polygonscan.com/",
        },
    ];

    useEffect(() => {
        const selected = networks.find((n) => n.chainId === current);
        if (selected) setNetwork(selected);
    }, [current]);

    const selectedName =
        networks.find((n) => n.chainId === current)?.name || "Select Network";

    return (
        <div className="relative inline-block w-72">
            {/* Dropdown Trigger */}
            <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full flex justify-between items-center bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold shadow-md hover:border-purple-500 transition-all"
            >
                <span>{selectedName}</span>
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
                        {networks.map((net) => (
                            <button
                                key={net.chainId}
                                onClick={() => {
                                    setCurrent(net.chainId);
                                    setDropdownOpen(false);
                                }}
                                className={`text-left px-5 py-3 hover:bg-gray-800 border-b border-gray-800 transition-colors ${
                                    current === net.chainId
                                        ? "text-purple-400"
                                        : "text-gray-300"
                                }`}
                            >
                                <span className="font-semibold ">
                                    {net.name}
                                </span>
                                <p className="text-xs text-gray-500">
                                    {net.currency}
                                </p>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
