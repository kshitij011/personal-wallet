"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletRedirect() {
    const router = useRouter();

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

    return null;
}
