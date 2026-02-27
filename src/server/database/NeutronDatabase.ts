import {NeutronConfig} from "../NeutronConfig";

export abstract class NeutronDatabase {
    abstract init(config: NeutronConfig): Promise<void>;
    abstract query(sql: string, params?: any[]): Promise<any[]>;
    abstract execute(sql: string, params?: any[]): Promise<void>;
    abstract close(): Promise<void>;
}