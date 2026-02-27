import express from "express";
import { NeutronServer } from "./NeutronServer";

export async function run(...args: string[]) {
    let configPath = "config.yml";

    const configIndex = args.indexOf("--config");
    if (configIndex !== -1 && args[configIndex + 1]) {
        configPath = args[configIndex + 1];
    }

    new NeutronServer();
    await NeutronServer.getInstance().init(configPath);
}