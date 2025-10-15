import { mnemonicToSeed } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { bytesToHex } from "@noble/hashes/utils";
import { keccak_256 } from "@noble/hashes/sha3";

export async function deriveAccount(mnemonic: string, index = 0) {
    const seed = await mnemonicToSeed(mnemonic); // seed generated here
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivationPath = `m/44'/60'/0'/0/${index}`;
    const child = hdKey.derive(derivationPath);

    const privateKey = bytesToHex(child.privateKey!);
    const publicKey = bytesToHex(child.publicKey!);
    const address =
        "0x" + bytesToHex(keccak_256(child.publicKey!.slice(1)).slice(-20));

    return { privateKey, publicKey, address };
}
