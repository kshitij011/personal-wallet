import { useState } from "react";
import RLP from "rlp";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { hexToBytes, bytesToHex } from "ethereum-cryptography/utils";

interface TxPreview {
    to: string;
    value: string;
    message?: string;
    nonce: number;
    baseFee: string;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
    gasLimit: number;
}

type UnsignedTxParams = {
    chainId: number;
    nonce: number;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
    gasLimit: number;
    to?: string;
    value: bigint;
    data?: string;
};

function SendTransaction({
    account,
    onTxSuccess,
}: {
    account: string;
    onTxSuccess: () => void;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [to, setTo] = useState("");
    const [value, setValue] = useState("");
    const [message, setMessage] = useState("");

    const [txPreview, setTxPreview] = useState<TxPreview | null>(null);
    const [estimatedGas, setEstimatedGas] = useState<number | null>(null);

    const [txStatus, setTxStatus] = useState<"idle" | "pending" | "done">(
        "idle"
    );
    const [txHash, setTxHash] = useState<string | null>(null);

    const getNonce = async () => {
        const body = {
            jsonrpc: "2.0",
            method: "eth_getTransactionCount",
            // method: "parity_nextNonce",  //Unsupported Media Type error
            params: [account, "latest"],
            id: 11155111,
        };

        const res = await fetch("https://rpc.sepolia.ethpandaops.io", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        console.log("Nonce: ", parseInt(data.result, 16));
        return parseInt(data.result, 16);
    };

    const getFeeData = async () => {
        const body = {
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params: ["latest", false],
            id: 1,
        };

        const res = await fetch("https://rpc.sepolia.ethpandaops.io", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        const baseFee = BigInt(data.result.baseFeePerGas);

        console.log("Base Fee Per Gas: ", baseFee);
        const maxPriorityFeePerGas = BigInt(1e9);

        const maxFeePerGas =
            baseFee + maxPriorityFeePerGas + baseFee / BigInt(2);
        return { baseFee, maxPriorityFeePerGas, maxFeePerGas };
    };

    const estimateGasLimit = async (tx: {
        from: string;
        to?: string;
        value?: string;
        data?: string;
    }): Promise<number> => {
        const body = {
            jsonrpc: "2.0",
            method: "eth_estimateGas",
            params: [tx],
            id: "1",
        };

        const res = await fetch("https://rpc.sepolia.ethpandaops.io", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return parseInt(data.result, 16);
    };

    function buildTransaction({
        chainId,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit,
        to,
        value,
        data,
    }: UnsignedTxParams) {
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

    function signTransaction(unsignedTx: (bigint | Uint8Array | never[])[]): {
        r: bigint;
        s: bigint;
        v: number;
    } {
        const encoded = RLP.encode(unsignedTx);
        const txHash = keccak256(Uint8Array.from([0x02, ...encoded]));

        const pk = process.env.NEXT_PUBLIC_PRIVATE_KEY!.replace(/^0x/, "");

        const sig = secp256k1.sign(txHash, hexToBytes(pk));

        return {
            r: sig.r,
            s: sig.s,
            v: sig.recovery,
        };
    }

    async function sendRawTransaction(rawTx: string): Promise<{
        jsonrpc: string;
        id: number;
        result?: string;
        error?: { code: number; message: string };
    }> {
        const body = {
            jsonrpc: "2.0",
            method: "eth_sendRawTransaction",
            params: [rawTx],
            id: 1,
        };

        const res = await fetch(
            process.env.NEXT_PUBLIC_ALCHEMY_URL
                ? process.env.NEXT_PUBLIC_ALCHEMY_URL
                : "",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        return await res.json();
    }

    const ConfirmTransaction = async () => {
        try {
            setTxStatus("pending");
            setTxHash(null);

            const chainId = 11155111;
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
            console.log("Transaction Hash:", result.result);

            setTxHash(result.result ?? null);
            setTxStatus("done");

            if (result.result) {
                onTxSuccess();
            }
        } catch (err) {
            console.error("Transaction failed", err);
            setTxStatus("idle");
        }
    };

    const openPreview = async () => {
        if (to && value) {
            const nonce = await getNonce();
            const { baseFee, maxPriorityFeePerGas, maxFeePerGas } =
                await getFeeData();

            const gasLimit = await estimateGasLimit({
                from: account,
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
            setTxStatus("idle");
            setTxHash(null);
            setIsModalOpen(true);
        } else {
            alert("Fields missing!");
        }
    };

    return (
        <div className="bg-transparent border-2 border-gray-700 rounded-xl h-fit mx-4 flex flex-row items-center">
            <div className="flex flex-col m-2 w-2/3 font-medium italic">
                <b>Send Transaction</b>
                <input
                    type="text"
                    placeholder="to address"
                    value={to}
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2 w-full"
                    onChange={(e) => setTo(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="value"
                    value={value}
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2 w-full"
                    onChange={(e) => setValue(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="message(optional)"
                    value={message}
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2 w-full"
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>
            <button
                className="mx-auto shadow-md bg-blue-400 px-2 py-2 rounded-md h-fit cursor-pointer hover:bg-blue-500"
                onClick={openPreview}
            >
                Send Transaction
            </button>

            {isModalOpen && txPreview && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-fit">
                        {txStatus === "idle" && (
                            <>
                                <h2 className="text-lg font-bold mb-4 text-center">
                                    Confirm Transaction
                                </h2>
                                <div className="text-sm space-y-2">
                                    <p>
                                        <b>To:</b> {txPreview.to}
                                    </p>
                                    <p>
                                        <b>Amount:</b> {txPreview.value} ETH
                                    </p>
                                    <p>
                                        <b>Base Fee:</b> {txPreview.baseFee}
                                    </p>
                                    <p>
                                        <b>Max Fee:</b> {txPreview.maxFeePerGas}
                                    </p>
                                    <p>
                                        <b>Priority Fee:</b>{" "}
                                        {txPreview.maxPriorityFeePerGas}
                                    </p>
                                    <p>
                                        <b>Gas Limit:</b> {txPreview.gasLimit}
                                    </p>
                                </div>
                            </>
                        )}

                        {txStatus === "pending" && (
                            <p className="text-center font-medium">
                                Broadcasting transaction...
                            </p>
                        )}

                        {txStatus === "done" && txHash && (
                            <div className="text-sm mt-4 w-fit">
                                <p className="mb-2">✅ Transaction Sent!</p>
                                <p>
                                    <b>Hash:</b>{" "}
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {txHash}
                                    </a>
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 mt-6">
                            {txStatus === "idle" && (
                                <>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-black font-medium cursor-pointer shadow-gray-600 shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={ConfirmTransaction}
                                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer shadow-gray-600 shadow-md"
                                    >
                                        Confirm
                                    </button>
                                </>
                            )}
                            {txStatus === "pending" && (
                                <button
                                    disabled
                                    className="px-4 py-2 rounded-lg bg-gray-400 text-white font-medium cursor-not-allowed"
                                >
                                    Transacting...
                                </button>
                            )}
                            {txStatus === "done" && (
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SendTransaction;
