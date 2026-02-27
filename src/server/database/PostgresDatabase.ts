import {NeutronDatabase} from "./NeutronDatabase";
import {NeutronConfig} from "../NeutronConfig";
import { Pool } from "pg";

export class PostgresDatabase extends NeutronDatabase {
    private config!: NeutronConfig;
    private pool!: Pool;
    private host!: string;
    private port!: number;
    private database!: string;
    private user!: string;
    private password!: string;
    private ssl!: boolean;

    async init(config: NeutronConfig) {
        this.config = config;
        this.host = config.getPathOrDefault("database.host", "localhost")
        this.port = config.getPathOrDefault("database.port", 5432)
        this.database = config.getPathOrDefault("database.database", "neutron")
        this.user = config.getPathOrDefault("database.user", "neutron")
        this.password = config.getPathOrDefault("database.password", "")
        this.ssl = config.getPathOrDefault("database.ssl", false)

        this.pool = new Pool({
            user: this.user,
            host: this.host,
            database: this.database,
            password: this.password,
            port: this.port,
            ssl: this.ssl ? { rejectUnauthorized: false } : false
        });

        await this.pool.query("SELECT NOW()");
    }

    async query(sql: string, params?: any[]): Promise<any[]> {
        const res = await this.pool.query(this.translateSql(sql), params);
        return res.rows;
    }

    async execute(sql: string, params?: any[]): Promise<void> {
        await this.pool.query(this.translateSql(sql), params);
    }

    async close(): Promise<void> {
        await this.pool.end();
    }

    private translateSql(sql: string): string {
        // Simple translation for SQLite syntax to Postgres if needed
        // For example, SQLite uses ? for placeholders, Postgres uses $1, $2, etc.
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    }
}