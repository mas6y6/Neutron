import { NeutronDatabase } from "./NeutronDatabase";
import { NeutronConfig } from "../NeutronConfig";
import mysql from "mysql2/promise";

export class MySQLDatabase extends NeutronDatabase {
    private pool!: mysql.Pool;

    async init(config: NeutronConfig): Promise<void> {
        const host = config.getPathOrDefault<string>("database.host", "localhost");
        const port = config.getPathOrDefault<number>("database.port", 3306);
        const database = config.getPathOrDefault<string>("database.database", "neutron");
        const user = config.getPathOrDefault<string>("database.user", "neutron");
        const password = config.getPathOrDefault<string>("database.password", "");
        const ssl = config.getPathOrDefault<boolean>("database.ssl", false);

        this.pool = mysql.createPool({
            host,
            port,
            database,
            user,
            password,
            ssl: ssl ? { rejectUnauthorized: false } : undefined,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        // sanity check
        await this.query("SELECT 1");
    }

    async query(sql: string, params: any[] = []): Promise<any[]> {
        const [rows] = await this.pool.query(sql, params);
        return Array.isArray(rows) ? rows as any[] : [];
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        await this.pool.execute(sql, params);
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
