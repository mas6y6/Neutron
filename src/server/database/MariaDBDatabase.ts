import { MySQLDatabase } from "./MySQLDatabase";
import { NeutronConfig } from "../NeutronConfig";

// MariaDB is largely compatible with MySQL protocol; reuse MySQL implementation
export class MariaDBDatabase extends MySQLDatabase {
    async init(config: NeutronConfig): Promise<void> {
        // Same as MySQL, but allow default port override if not provided
        const withDefaultPort = new NeutronConfig({
            ...((config as any).content ?? {}),
            database: {
                ...(config as any).content?.database,
                port: config.getPathOrDefault<number>("database.port", 3306)
            }
        });
        await super.init(withDefaultPort);
    }
}
