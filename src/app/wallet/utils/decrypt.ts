// utils/decrypt.ts
export async function decryptMnemonic(
    password: string
): Promise<string | null> {
    const storedData = localStorage.getItem("wallet_encrypted");
    if (!storedData) {
        console.error("No encrypted wallet found");
        return null;
    }

    const { ciphertext, iv, salt } = JSON.parse(storedData);

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // Derive key material
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // Derive AES key
    const derivedAesKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // Decrypt ciphertext
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)),
        },
        derivedAesKey,
        Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
    );

    const mnemonic = decoder.decode(decrypted);
    return mnemonic;
}
