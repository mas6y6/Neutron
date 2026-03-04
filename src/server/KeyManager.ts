import crypto, { KeyObject } from "crypto";

export class KeyManager {
    public publicKey: KeyObject | null = null;
    public privateKey: KeyObject | null = null;

    generateKeys() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
        });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
}