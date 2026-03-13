import {fetchWithCsrf, base64ToUint8Array, uint8ArrayToBase64} from "./utils";

export interface Vault {

}

class VaultSession {
    private static vaultKey: Uint8Array | null = null;
    private static vault: Vault | null = null;

    static setKey(key: Uint8Array) {
        this.vaultKey = key;
    }

    static getKey(): Uint8Array | null {
        return this.vaultKey;
    }

    static getVault(): Vault | null {
        return this.vault;
    }

    static clear() {
        if (this.vaultKey) {
            this.vaultKey.fill(0); // wipe memory
        }
        this.vaultKey = null;
    }

    static async obtainVault() {
        const res = await (await fetchWithCsrf("/api/auth/get_vault", { method: "POST" })).json();

        const encryptedVault = base64ToUint8Array(res.vault);
        const iv = base64ToUint8Array(res.vaultIv);
        const tag = base64ToUint8Array(res.vaultTag);

        const key = this.getKey();
        if (!key) throw new Error("Vault key not available");

        const aesKey = await crypto.subtle.importKey(
            "raw",
            new Uint8Array(key).buffer,
            "AES-GCM",
            false,
            ["decrypt"]
        );

        const ciphertextWithTag = new Uint8Array(encryptedVault.length + tag.length);
        ciphertextWithTag.set(encryptedVault, 0);
        ciphertextWithTag.set(tag, encryptedVault.length);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(iv).buffer,
                tagLength: 128
            },
            aesKey,
            ciphertextWithTag
        );

        const vaultStr = new TextDecoder().decode(decrypted);
        this.vault = JSON.parse(vaultStr);

        return this.vault;
    }

    static async updateVault(newVault: Vault) {
        const key = this.getKey();
        if (!key) throw new Error("Vault key not available");

        const aesKey = await crypto.subtle.importKey(
            "raw",
            new Uint8Array(key).buffer,
            "AES-GCM",
            false,
            ["encrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = new TextEncoder().encode(JSON.stringify(newVault));

        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
                tagLength: 128
            },
            aesKey,
            data
        );

        // WebCrypto AES-GCM appends the tag to the ciphertext
        const encryptedArray = new Uint8Array(encrypted);
        const tagLength = 16;
        const ciphertext = encryptedArray.slice(0, encryptedArray.length - tagLength);
        const tag = encryptedArray.slice(encryptedArray.length - tagLength);

        const res = await fetchWithCsrf("/api/auth/update_vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vault: uint8ArrayToBase64(ciphertext),
                vaultIv: uint8ArrayToBase64(iv),
                vaultTag: uint8ArrayToBase64(tag)
            })
        });

        if (!res.ok) {
            throw new Error("Failed to update vault: " + res.statusText);
        }

        this.vault = newVault;
        return this.vault;
    }
}

export default VaultSession;