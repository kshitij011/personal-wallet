import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { hexToBytes, bytesToHex } from "ethereum-cryptography/utils.js";
import { useState } from "react";

interface SignatureData {
    messageHash: string;
    signatureBytes: string;
    r: string;
    s: string;
    v: number;
}

function SignMessage() {
    // const [message, setMessage] = useState("");
    const [amount, setAmount] = useState("");
    const [channelAddress, setChannelAddress] = useState("");
    const [signatureData, setSignatureData] = useState<SignatureData | null>(
        null
    );
    const [signaturePreview, setSignaturePreview] = useState<boolean>(false);

    async function signPayment() {
        if (amount && channelAddress) {
            const pk: string = process.env.NEXT_PUBLIC_PRIVATE_KEY
                ? process.env.NEXT_PUBLIC_PRIVATE_KEY
                : "";

            const priv: Uint8Array = hexToBytes(
                pk.startsWith("0x") ? pk.slice(2) : pk
            );
            if (priv.length !== 32)
                throw new Error("Private key must be 32 bytes");

            // --- abi.encodePacked(address(this), amount) ---
            function packAddressUint256(
                addressHex: string,
                amountBigInt: bigint
            ): Uint8Array {
                const addr = hexToBytes(addressHex.slice(2));
                if (addr.length !== 20)
                    throw new Error("address must be 20 bytes");

                const amt = new Uint8Array(32);
                let x = amountBigInt;
                for (let i = 31; i >= 0; i--) {
                    amt[i] = Number(x & BigInt(0xff));
                    x >>= BigInt(8);
                }
                const out = new Uint8Array(addr.length + amt.length);
                out.set(addr, 0);
                out.set(amt, addr.length);
                return out;
            }

            function channelInnerHash(channelAddress: string, amount: string) {
                return keccak256(
                    packAddressUint256(channelAddress, BigInt(amount))
                );
            }

            function toEthSignedMessageHash(innerHashBytes: Uint8Array) {
                const prefix = new TextEncoder().encode(
                    "\x19Ethereum Signed Message:\n32" // literal characters: 3, 2
                );
                const out = new Uint8Array(
                    prefix.length + innerHashBytes.length
                );
                out.set(prefix, 0);
                out.set(innerHashBytes, prefix.length);
                return keccak256(out);
            }

            const inner = channelInnerHash(channelAddress, amount);
            const ethHash = toEthSignedMessageHash(inner);

            // 👉 new API: returns signature (64 bytes) + recovery (0/1)
            const sig = secp256k1.sign(ethHash, priv);
            const signature = sig.toCompactRawBytes(); // 64 bytes r||s
            const recovery = sig.recovery; // 0 or 1

            const r = "0x" + bytesToHex(signature.slice(0, 32));
            const s = "0x" + bytesToHex(signature.slice(32, 64));
            const v = 27 + recovery; // 27 or 28

            const sig65 = new Uint8Array(65);
            sig65.set(signature, 0);
            sig65[64] = v;

            setSignatureData({
                messageHash: "0x" + bytesToHex(ethHash),
                signatureBytes: "0x" + bytesToHex(sig65),
                r: r,
                s: s,
                v: v,
            });

            setSignaturePreview(true);
        } else {
            alert("Fields missing!");
        }
    }

    return (
        <div className="bg-transparent border-2 border-gray-700 rounded-xl h-fit mx-4 flex flex-row items-center">
            <div className="flex flex-col m-2 w-2/3 font-medium italic">
                <b> Sign Payment Channel</b>
                {/* <input
                    type="text"
                    placeholder="Message"
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2"
                /> */}
                <input
                    type="text"
                    placeholder="channel address"
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2"
                    onChange={(e) => setChannelAddress(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="amount"
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                {/* <input
                    type="text"
                    placeholder="User address"
                    className="bg-gray-400 m-2 rounded-xl shadow-md pl-2"
                /> */}
            </div>
            <button
                className="mx-auto shadow-md bg-blue-400 px-2 py-2 rounded-md h-fit cursor-pointer hover:bg-blue-500"
                onClick={signPayment}
            >
                Sign Message
            </button>

            {signatureData && signaturePreview && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-3/4 text-gray-700 text-lg">
                        <h1 className="font-bold">Signature Data</h1>
                        <p>
                            <b className="text-black">Message Hash:</b>{" "}
                            {signatureData.messageHash}
                        </p>
                        <p className="break-words whitespace-pre-wrap">
                            <b className="text-black">Signature:</b>{" "}
                            {signatureData.signatureBytes}
                        </p>
                        <p>
                            <b className="text-black">r:</b> {signatureData.r}
                        </p>
                        <p>
                            <b className="text-black">s:</b> {signatureData.s}
                        </p>
                        <p>
                            <b className="text-black">v:</b> {signatureData.v}
                        </p>
                        <button
                            onClick={() => setSignaturePreview(false)}
                            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignMessage;

// 0x5FbDB2315678afecb367f032d93F642f64180aa3
// 150000000000000000
