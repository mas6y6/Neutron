import VaultSession from "./VaultSession";
import {modalContainerRef} from "./App";
const VAULT_KEY_STORAGE = "vaultKeyBase64";

export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function animationCooldown() {
    await sleep(100);
    await new Promise(requestAnimationFrame);
}

export function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "";
}

export async function fetchWithCsrf(url: string, init?: RequestInit) {
    const token = getCsrfToken();

    const headers = new Headers(init?.headers || {});
    if (token) {
        headers.set('X-CSRF-Token', token);
    }
    return fetch(url, { credentials: "same-origin", ...init, headers });
}

export async function obtainVaultKey(password: string, data: any): Promise<Uint8Array> {
    const encVaultKey = base64ToUint8Array(data.encryptedVaultKey);
    const iv = base64ToUint8Array(data.vaultKeyIv);
    const tag = base64ToUint8Array(data.vaultKeyTag);
    const salt = base64ToUint8Array(data.vaultSalt);

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // Import the password as a base key for PBKDF2
    const baseKey = await crypto.subtle.importKey(
        "raw",
        passwordBytes.buffer.slice(passwordBytes.byteOffset, passwordBytes.byteOffset + passwordBytes.byteLength),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    // Derive AES-GCM key
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: new Uint8Array(salt).buffer,
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["decrypt"]
    );

    // Combine ciphertext + tag
    const ciphertextWithTag = new Uint8Array(encVaultKey.length + tag.length);
    ciphertextWithTag.set(encVaultKey, 0);
    ciphertextWithTag.set(tag, encVaultKey.length);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv).buffer,
            tagLength: 128
        },
        aesKey,
        ciphertextWithTag.buffer.slice(ciphertextWithTag.byteOffset, ciphertextWithTag.byteOffset + ciphertextWithTag.byteLength)
    );

    const key = new Uint8Array(decrypted);
    VaultSession.setKey(key);

    const server_res = await (await fetchWithCsrf("/api/status", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })).json();

    if (server_res.require_password_on_reload == false) {
        saveVaultKey(key);
    }

    return key;
}

export function base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) return new Uint8Array(0);
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export function saveVaultKey(key: Uint8Array) {
    const base64 = btoa(String.fromCharCode(...key));
    localStorage.setItem(VAULT_KEY_STORAGE, base64);
}

export function clearVaultKey() {
    localStorage.removeItem(VAULT_KEY_STORAGE);
    VaultSession.clear();
}

export function loadVaultKey(): Uint8Array | null {
    const base64 = localStorage.getItem(VAULT_KEY_STORAGE);
    if (!base64) return null;
    const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
    VaultSession.setKey(bytes);
    return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function logout() {
    try {
        await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    } catch (e) {
        console.warn("Normal logout failed, forcing logout", e);
        try {
            await fetchWithCsrf("/api/auth/force_logout", { method: "POST" });
        } catch (forceErr) {
            console.error("Force logout also failed", forceErr);
        }
    } finally {
        clearVaultKey();
        modalContainerRef.current?.close();
        await animationCooldown();
        window.location.reload();
    }
}

/**
 * Encrypt data using an RSA public key (PEM format) and RSA-OAEP.
 */
export async function encryptWithPublicKey(publicKeyPem: string, data: Uint8Array): Promise<Uint8Array> {
    const pemContents = publicKeyPem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, "");
    const binaryKey = base64ToUint8Array(pemContents);

    const publicKey = await crypto.subtle.importKey(
        "spki",
        new Uint8Array(binaryKey),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        new Uint8Array(data)
    );

    return new Uint8Array(encrypted);
}

/**
 * Decrypt data using an RSA private key (PEM format) and RSA-OAEP.
 */
export async function decryptWithPrivateKey(privateKeyPem: string, encryptedData: Uint8Array): Promise<Uint8Array> {
    const pemContents = privateKeyPem
        .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/, "")
        .replace(/-----END (RSA )?PRIVATE KEY-----/, "")
        .replace(/\s/g, "");
    const binaryKey = base64ToUint8Array(pemContents);

    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        new Uint8Array(binaryKey),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        new Uint8Array(encryptedData)
    );

    return new Uint8Array(decrypted);
}