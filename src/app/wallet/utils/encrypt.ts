// utils/encrypt.ts
export async function deriveKeyFromPassword(password: string) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    return { derivedKey, salt };
}

export async function encryptMnemonic(mnemonic: string, derivedKey: CryptoKey) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV must be 12 bytes

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        encoder.encode(mnemonic)
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}
