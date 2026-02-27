import { NeutronDatabase } from "./NeutronDatabase";
import { NeutronConfig } from "../NeutronConfig";
import path from "node:path";
import sqlite3 from "sqlite3";

export class SQLiteDatabase extends NeutronDatabase {
    private db!: sqlite3.Database;

    async init(config: NeutronConfig): Promise<void> {
        const dbPath = config.getPathOrDefault<string>(
            "database.path",
            path.join(config.data_folder, "neutron.db")
        );

        await new Promise<void>((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) reject(err); else resolve();
            });
        });

        // Enforce foreign keys similar to other RDBMS
        await this.execute("PRAGMA foreign_keys = ON");
    }

    async query(sql: string, params: any[] = []): Promise<any[]> {
        return await new Promise<any[]>((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err); else resolve(rows || []);
            });
        });
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        return await new Promise<void>((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) reject(err); else resolve();
            });
        });
    }

    async close(): Promise<void> {
        return await new Promise<void>((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err); else resolve();
            });
        });
    }
}
