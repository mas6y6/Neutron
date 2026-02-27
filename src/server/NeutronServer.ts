import express from "express";
import * as http from "node:http";
import * as path from "node:path";
import * as fs from "fs/promises";
import yaml from "js-yaml";
import {NeutronConfig} from "./NeutronConfig";
import keytar from "keytar";
import crypto from "crypto";
import { createLogger } from "./logger";
import winston from "winston";

export class NeutronServer {
    private static instance: NeutronServer;
    private app: express.Application;
    private server: http.Server;
    private port: number = 3000;
    private config!: NeutronConfig;
    public logger!: winston.Logger;
    private masterkey!: Buffer;

    public static getInstance(): NeutronServer {
        if (!NeutronServer.instance) {
            throw new Error("NeutronServer instance not initialized");
        }
        return NeutronServer.instance;
    }

    constructor() {
        if (NeutronServer.instance) {
            throw new Error("NeutronServer instance already initialized");
        }

        NeutronServer.instance = this;

        this.app = express();
        this.server = http.createServer(this.app);
    }

    async init(configPath: string = "config.yml") {
        try {
            await fs.access(configPath);
            this.config = await NeutronConfig.loadSafe(configPath);

            this.port = this.config.port;

            const dataFolderPath = path.resolve(this.config.data_folder);
            try {
                await fs.access(dataFolderPath);
                // exists
            } catch (err) {
                if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                    await fs.mkdir(dataFolderPath, {recursive: true});
                } else {
                    throw err;
                }
            }

            this.logger = await createLogger({
                level: this.config.debug ? "debug" : "info",
                logsFolder: this.config.logs_folder,
                console: this.config.logging_console,
                file: this.config.logging_file,
                maxFiles: this.config.logging_max_files,
            });
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                this.config = new NeutronConfig();
                const dataFolderPath = path.resolve(this.config.data_folder);
                await fs.mkdir(dataFolderPath, { recursive: true });
            } else {
                console.error(err);
            }
        }

        if (this.config.store_master_key_in_keychain) {
            let stored = await keytar.getPassword(this.config.masterkey_keychain_service, this.config.masterkey_keychain_account);

            if (stored) {
                this.masterkey = Buffer.from(stored, "base64");
            } else {
                this.masterkey = crypto.randomBytes(32);
                await keytar.setPassword(this.config.masterkey_keychain_service, this.config.masterkey_keychain_account, this.masterkey.toString("base64"));
            }
        } else {
            try {
                await fs.access(path.join(this.config.data_folder, "masterkey.key"));
                let base64 = await fs.readFile(path.join(this.config.data_folder, "masterkey.key"), "utf-8");
                this.masterkey = Buffer.from(base64, "base64");
            } catch {
                this.masterkey = crypto.randomBytes(32);
                await fs.writeFile(path.join(this.config.data_folder, "masterkey.key"), this.masterkey.toString("base64"), "utf-8");
            }
        }


    }
}