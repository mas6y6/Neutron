import fs from "fs/promises";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"; // <- correct import

export interface LoggerOptions {
    level?: string;
    logsFolder?: string;
    console?: boolean;
    file?: boolean;
    maxFiles?: string;
}

export async function createLogger(options: LoggerOptions = {}): Promise<winston.Logger> {
    const level = options.level ?? "info";
    const logsFolder = options.logsFolder ? path.resolve(options.logsFolder) : path.resolve("./logs");
    const enableConsole = options.console ?? true;
    const enableFile = options.file ?? true;
    const maxFiles = options.maxFiles ?? "14d";

    if (enableFile) {
        try {
            await fs.mkdir(logsFolder, { recursive: true });
        } catch (err) {
            console.error("Failed to create logs folder:", err);
        }
    }

    const upperCaseLevel = winston.format((info) => {
        info.level = info.level.toUpperCase();
        return info;
    });

    const formatter = winston.format.combine(
        upperCaseLevel(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
    );

    const transports: winston.transport[] = [];

    if (enableConsole) {
        transports.push(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                formatter
            )
        }));
    }

    if (enableFile) {
        transports.push(new DailyRotateFile({
            dirname: logsFolder,
            filename: "%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: false,
            level,
            format: formatter,
            maxFiles,
        }));
    }

    return winston.createLogger({
        level,
        transports,
        exitOnError: false,
    });
}