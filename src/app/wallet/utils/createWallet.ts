import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export function createWallet() {
    const mnemonic = generateMnemonic(wordlist, 128);
    return mnemonic;
}
