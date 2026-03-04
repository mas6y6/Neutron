export interface EncryptedPayload {
    key: string;
    iv: string;
    authTag: string;
    data: string;
}

export class NeutronEncryption {
    private clientKeyPair: CryptoKeyPair | null = null;
    private serverPublicKey: CryptoKey | null = null;
    private ws!: WebSocket;
    private clientID!: string;
    private interval: number = 10000;

    async handshake() {
        const host = window.location.hostname;
        const port = window.location.port;
        const hostname = port ? `${host}:${port}` : host;

        try {
            this.ws = new WebSocket(`wss://${hostname}/api/handshake`);
            await this.waitForOpen();
        } catch {
            this.ws = new WebSocket(`ws://${hostname}/api/handshake`);
            await this.waitForOpen();
        }

        const idMsg = await this.waitForMessage();
        this.clientID = idMsg.data;

        const pubKeyMsg = await this.waitForMessage();
        await this.loadServerPublicKey(pubKeyMsg.data);

        await this.generateClientKeys();

        this.ws.send(JSON.stringify({
            clientID: this.clientID,
            publicKey: await this.exportClientPublicKey(),
        }));

        setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: "ping" }));
            }
        }, this.interval);
    }

    private waitForOpen(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws.addEventListener("open", () => resolve());
            this.ws.addEventListener("error", (err) => reject(err));
        });
    }

    private waitForMessage(): Promise<MessageEvent> {
        return new Promise((resolve) => {
            const handler = (event: MessageEvent) => {
                this.ws.removeEventListener("message", handler);
                resolve(event);
            };
            this.ws.addEventListener("message", handler);
        });
    }

    private async loadServerPublicKey(pem: string) {
        const b64 = pem.replace(/-----.*?-----/g, "").replace(/\s+/g, "");
        const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        this.serverPublicKey = await crypto.subtle.importKey(
            "spki",
            binary.buffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );
    }

    private async generateClientKeys() {
        this.clientKeyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    private async exportClientPublicKey(): Promise<string> {
        if (!this.clientKeyPair) throw new Error("Client keys not generated");
        const raw = await crypto.subtle.exportKey("spki", this.clientKeyPair.publicKey);
        return btoa(String.fromCharCode(...new Uint8Array(raw)));
    }

    async encrypt(message: string): Promise<EncryptedPayload> {
        if (!this.serverPublicKey) throw new Error("Server public key not loaded");

        const aesKey = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encodedMsg = new TextEncoder().encode(message);
        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            aesKey,
            encodedMsg
        );

        const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
        const encryptedKey = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            this.serverPublicKey,
            rawAesKey
        );

        return {
            key: NeutronEncryption.arrayBufferToBase64(encryptedKey),
            iv: NeutronEncryption.arrayBufferToBase64(iv.buffer),
            authTag: NeutronEncryption.arrayBufferToBase64(encryptedData.slice(-16)),
            data: NeutronEncryption.arrayBufferToBase64(encryptedData),
        };
    }

    async decrypt(payload: EncryptedPayload): Promise<string> {
        if (!this.clientKeyPair) throw new Error("Client keys not generated");

        const aesKeyRaw = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            this.clientKeyPair.privateKey,
            NeutronEncryption.base64ToArrayBuffer(payload.key)
        );

        const aesKey = await crypto.subtle.importKey(
            "raw",
            aesKeyRaw,
            { name: "AES-GCM" },
            true,
            ["decrypt"]
        );

        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(NeutronEncryption.base64ToArrayBuffer(payload.iv)),
                tagLength: 128
            },
            aesKey,
            NeutronEncryption.base64ToArrayBuffer(payload.data)
        );

        return new TextDecoder().decode(decrypted);
    }

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    private static base64ToArrayBuffer(b64: string): ArrayBuffer {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    }
}