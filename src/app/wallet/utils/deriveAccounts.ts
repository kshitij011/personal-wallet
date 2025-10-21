import { mnemonicToSeed } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { keccak_256 } from "@noble/hashes/sha3";
import { secp256k1 } from "@noble/curves/secp256k1";

export interface DerivedAccount {
    privateKey: string;
    publicKey: string;
    address: string;
    index: number;
}

export async function deriveAccounts(
    mnemonic: string,
    indexes: number[] = [0]
): Promise<DerivedAccount[]> {
    const seed = await mnemonicToSeed(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);

    return indexes.map((index) => {
        const derivationPath = `m/44'/60'/0'/0/${index}`;
        const child = hdKey.derive(derivationPath);

        const privateKey = bytesToHex(child.privateKey!);

        const publicKeyFull = secp256k1.getPublicKey(child.privateKey!, false);
        const publicKey = publicKeyFull.slice(1);
        const address = "0x" + bytesToHex(keccak_256(publicKey).slice(-20));

        return {
            privateKey: "0x" + privateKey,
            publicKey: "0x" + bytesToHex(publicKeyFull),
            address,
            index,
        };
    });
}
