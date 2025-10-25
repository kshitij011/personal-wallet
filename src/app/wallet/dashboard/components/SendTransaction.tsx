// @ts-nocheck
"use client";
import { useNetworkStore } from "@/app/wallet/store/networkStore";
import { useState } from "react";
import RLP from "rlp";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { hexToBytes } from "ethereum-cryptography/utils";

interface SendTransactionProps {
    account: {
        address: string;
        privateKey: string;
    };
    onTxSuccess: () => void;
}

export default function SendTransaction({
    account,
    onTxSuccess,
}: SendTransactionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [to, setTo] = useState("");
    const [value, setValue] = useState("");
    const [message, setMessage] = useState("");
    const [txPreview, setTxPreview] = useState<any>(null);
    const [estimatedGas, setEstimatedGas] = useState<number | null>(null);
    const [txStatus, setTxStatus] = useState<
        "idle" | "pending" | "done" | "failed"
    >("idle");
    const [txHash, setTxHash] = useState<string | null>(null);

    const { selectedNetwork } = useNetworkStore();

    // ============= Helper RPC Calls =============

    const rpcCall = async (method: string, params: any[]) => {
        const body = {
            jsonrpc: "2.0",
            method,
            params,
            id: 1,
        };
        const res = await fetch(selectedNetwork.rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`RPC HTTP error ${res.status}: ${text}`);
        }

        const json = await res.json();

        if (json.error) {
            throw new Error(`RPC Error: ${JSON.stringify(json.error)}`);
        }

        return json;
    };

    const getNonce = async () => {
        const res = await rpcCall("eth_getTransactionCount", [
            account.address,
            "latest",
        ]);
        return parseInt(res.result, 16);
    };

    const getFeeData = async () => {
        const res = await rpcCall("eth_getBlockByNumber", ["latest", false]);
        const baseFee = BigInt(res.result.baseFeePerGas);
        const maxPriorityFeePerGas = BigInt(1e9);
        const maxFeePerGas =
            baseFee + maxPriorityFeePerGas + baseFee / BigInt(2);
        return { baseFee, maxPriorityFeePerGas, maxFeePerGas };
    };

    const estimateGasLimit = async (tx: any) => {
        const res = await rpcCall("eth_estimateGas", [tx]);
        return parseInt(res.result, 16);
    };

    // ============= Transaction Building =============
    function buildTransaction(params: any) {
        const {
            chainId,
            nonce,
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit,
            to,
            value,
            data,
        } = params;
        return [
            BigInt(chainId),
            BigInt(nonce),
            BigInt(maxPriorityFeePerGas),
            BigInt(maxFeePerGas),
            BigInt(gasLimit),
            to ? hexToBytes(to.replace(/^0x/, "")) : [],
            BigInt(value),
            data ? hexToBytes(data.replace(/^0x/, "")) : [],
            [],
        ];
    }

    function signTransaction(unsignedTx: (bigint | Uint8Array | never[])[]) {
        const encoded = RLP.encode(unsignedTx);
        const txHash = keccak256(Uint8Array.from([0x02, ...encoded]));
        const pk = account.privateKey!.replace(/^0x/, "");
        const sig = secp256k1.sign(txHash, hexToBytes(pk));
        return { r: sig.r, s: sig.s, v: sig.recovery };
    }

    const sendRawTransaction = async (rawTx: string) => {
        return await rpcCall("eth_sendRawTransaction", [rawTx]);
    };

    // ============= Confirm Transaction =============
    const ConfirmTransaction = async () => {
        try {
            setTxStatus("pending");
            setTxHash(null);
            const chainId = selectedNetwork.chainId;
            const data = message
                ? "0x" + Buffer.from(message, "utf8").toString("hex")
                : "0x";
            const { maxPriorityFeePerGas, maxFeePerGas } = await getFeeData();
            const nonce = await getNonce();
            const gasLimit = estimatedGas ?? 21000;

            const unsignedTx = buildTransaction({
                chainId,
                nonce,
                maxPriorityFeePerGas,
                maxFeePerGas,
                gasLimit,
                to,
                value: BigInt(value),
                data,
            });

            const { r, s, v } = signTransaction(unsignedTx);
            const signedTx = [...unsignedTx, v, r, s];
            const rawTx =
                "0x02" + Buffer.from(RLP.encode(signedTx)).toString("hex");

            const result = await sendRawTransaction(rawTx);
            setTxHash(result.result);
            setTxStatus("done");

            if (result.result) onTxSuccess();
        } catch (err) {
            setTxStatus("failed");
            console.error("Transaction failed", err);
        }
    };

    const openPreview = async () => {
        if (!to || !value) return alert("Recipient and value required");
        const nonce = await getNonce();
        const { baseFee, maxPriorityFeePerGas, maxFeePerGas } =
            await getFeeData();

        const gasLimit = await estimateGasLimit({
            from: account.address,
            to,
            value: "0x" + BigInt(value).toString(16),
            data: message
                ? "0x" + Buffer.from(message, "utf8").toString("hex")
                : "0x",
        });

        setEstimatedGas(gasLimit);

        const preview = {
            to,
            value,
            message,
            nonce,
            baseFee: baseFee.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
            maxFeePerGas: maxFeePerGas.toString(),
            gasLimit,
        };

        setTxPreview(preview);
        setTxHash(null);
        setTxStatus("idle");
        setIsModalOpen(true);
    };

    return (
        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 mt-6 text-left">
            <h3 className="text-2xl font-semibold text-purple-300 mb-4">
                Send Transaction
            </h3>

            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Recipient Address"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Amount in WEI"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Message (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                    onClick={openPreview}
                    className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform cursor-pointer"
                >
                    Preview & Send
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6 w-[400px] border border-gray-700">
                        {txStatus === "idle" && txPreview && (
                            <>
                                <h2 className="text-xl font-bold mb-4 text-center">
                                    Confirm Transaction
                                </h2>
                                <div className="text-sm space-y-2">
                                    <p>
                                        <b>To:</b> {txPreview.to}
                                    </p>
                                    <p>
                                        <b>Value:</b> {txPreview.value}
                                    </p>
                                    <p>
                                        <b>Gas Limit:</b> {txPreview.gasLimit}
                                    </p>
                                    <p>
                                        <b>Base Fee:</b>{" "}
                                        {txPreview.baseFee.toString()}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={ConfirmTransaction}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </>
                        )}

                        {txStatus === "pending" && (
                            <>
                                <p className="text-center">
                                    ⏳ Sending Transaction...
                                </p>
                            </>
                        )}

                        {txStatus === "failed" && (
                            <div className="mt-4 text-sm text-red-400 text-center">
                                ❌ Transaction Failed
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {txStatus === "done" && txHash && (
                            <div className="mt-4 text-sm text-center">
                                ✅ Sent! Hash:{" "}
                                <a
                                    href={`${selectedNetwork.explorer}/tx/${txHash}`}
                                    target="_blank"
                                    className="underline text-blue-400"
                                >
                                    {txHash.slice(0, 12)}...
                                </a>
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Safety fallback */}
                        {txStatus !== "idle" &&
                            !txHash &&
                            !txPreview &&
                            txStatus !== "pending" &&
                            txStatus !== "failed" && (
                                <div className="text-center text-gray-300">
                                    Unknown state
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
