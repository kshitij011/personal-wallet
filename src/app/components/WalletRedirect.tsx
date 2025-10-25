"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletRedirect() {
    const router = useRouter();

    useEffect(() => {
        try {
            const vault = localStorage.getItem("wallet_encrypted");

            const accounts = localStorage.getItem("walletAccounts");

            if (!vault && accounts) {
                localStorage.removeItem("walletAccounts");
            }

            if (vault) {
                console.log(
                    "Found encrypted mnemonic in localStorage, rdirecting to unlock."
                );

                router.replace("/wallet/unlock");
            } else {
                console.log(
                    "Couldn't find mnemonic, redirecting to create account."
                );
                router.replace("/wallet/create");
            }
        } catch (error) {
            console.error("Storage check failed: ", error);
        }
    });

    return null;
}
