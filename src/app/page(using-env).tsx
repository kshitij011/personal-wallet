"use client";

import SignMessage from "./components/SignMessage";
import SendTransaction from "./components/SendTransaction";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { hexToBytes, bytesToHex } from "ethereum-cryptography/utils";
import { useEffect, useState, useCallback } from "react";

export default function Home() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    if (!process.env.NEXT_PUBLIC_PRIVATE_KEY) {
        alert("Private key missing!");
    }
    const privateKey: Uint8Array = hexToBytes(
        process.env.NEXT_PUBLIC_PRIVATE_KEY
            ? process.env.NEXT_PUBLIC_PRIVATE_KEY
            : ""
    );

    //derive public key
    useEffect(() => {
        const publicKey = secp256k1.getPublicKey(privateKey, false).slice(1);
        const address = "0x" + bytesToHex(keccak256(publicKey).slice(-20));
        console.log("Wallet public address: ", publicKey);
        console.log("Wallet address: ", address);
        setAccount(address);
    }, []);

    const refreshBalance = useCallback(async () => {
        if (!account) return;

        const body = {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [account, "latest"],
            id: 1,
        };

        const res = await fetch("https://rpc.sepolia.ethpandaops.io", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (data.result) {
            const wei = BigInt(data.result);
            const eth = Number(wei) / 1e18;
            setBalance(eth.toFixed(6));
        }
    }, [account]);

    // fetch balance once account is ready
    useEffect(() => {
        refreshBalance();
    }, [refreshBalance]);

    return (
        <>
            <div className="bg-blue-300 h-screen w-full content-center">
                <div className="bg-gray-300 shadow-2xl h-10/12 w-2/3 m-auto text-center rounded-2xl text-xl font-bold text-gray-800 font flex flex-col justify-around">
                    <i>Personal wallet</i>
                    <i className="font-extralight">
                        Connected Account: {account}
                    </i>
                    <i className="font-extralight">
                        Balance:{" "}
                        <b>{balance ? `${balance} ETH` : "Loading..."}</b>
                    </i>
                    <SignMessage />
                    <SendTransaction
                        account={account ?? ""}
                        onTxSuccess={refreshBalance} // pass balance refresher
                    />
                </div>
            </div>
        </>
    );
}
