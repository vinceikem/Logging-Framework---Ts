import fs from "fs";
import path from "path";
import chalk from "chalk";
import axios from "axios";

enum Level {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
}

type Env = "dev" | "prod";

function color(level: Level): string {
    switch (level) {
        case Level.DEBUG: return chalk.green(Level[level]);
        case Level.INFO: return chalk.blue(Level[level]);
        case Level.WARN: return chalk.yellow(Level[level]);
        case Level.ERROR: return chalk.red(Level[level]);
        case Level.FATAL: return chalk.magenta(Level[level]);
        default: return Level[level];
    }
}

function prettyPrint(object: Record<string, unknown>, indent: number = 2): string {
    let result = "{";
    for (const key of Object.keys(object)) {
        result += `\n${" ".repeat(indent)}${key}: ${object[key]}`;
    }
    return result + "\n}";
}

export class Logger {
    private env: Env;
    private logFile: string;
    private httpEndpoint?: string;
    private minLevel: Level;

    constructor(env: Env, httpEndpoint?: string, minLevel: Level = Level.WARN) {
        this.env = env;
        this.httpEndpoint = httpEndpoint;
        this.minLevel = env === "dev" ? Level.DEBUG : minLevel;

        // Ensure logs directory
        const logDir = path.join(__dirname, "logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        // Daily log file: 2025-10-03.log
        const fileName = `${new Date().toISOString().split("T")[0]}.log`;
        this.logFile = path.join(logDir, fileName);
    }

    private async writeToFile(line: string): Promise<void> {
        try {
            await fs.promises.appendFile(this.logFile, line + "\n", "utf-8");
        } catch (err) {
            console.error("File log failed:", (err as Error).message);
        }
    }

    private async sendToHttp(payload: object): Promise<void> {
        try {
            if (this.httpEndpoint) {
                await axios.post(this.httpEndpoint, payload);
            }
        } catch (err) {
            console.error("HTTP log failed:", (err as Error).message);
        }
    }

    private shouldLog(level: Level): boolean {
        return level >= this.minLevel;
    }

    private async log(
        level: Level,
        context: string,
        message: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        if (!this.shouldLog(level)) return;

        const timestamp = new Date().toISOString();
        const payload = {
            level: Level[level],
            timestamp,
            context,
            message,
            metadata: metadata || null,
        };

        // Console (dev colored, prod plain)
        const formatted = `[${Level[level]}] ${timestamp} - ${context} - ${message}`;
        if (this.env === "dev") {
            console.log(
                `[${color(level)}] ${timestamp} - ${chalk.yellow(context)} - ${message}${
                    metadata ? `\n${chalk.cyanBright(prettyPrint(metadata))}` : ""
                }`
            );
        } else {
            console.log(formatted);
        }

        // File logging (structured JSON)
        await this.writeToFile(JSON.stringify(payload));

        // Remote logging
        if (this.httpEndpoint) {
            await this.sendToHttp(payload);
        }
    }

    debug(ctx: string, msg: string, meta?: Record<string, unknown>) {
        this.log(Level.DEBUG, ctx, msg, meta);
    }
    info(ctx: string, msg: string, meta?: Record<string, unknown>) {
        this.log(Level.INFO, ctx, msg, meta);
    }
    warn(ctx: string, msg: string, meta?: Record<string, unknown>) {
        this.log(Level.WARN, ctx, msg, meta);
    }
    error(ctx: string, msg: string, meta?: Record<string, unknown>) {
        this.log(Level.ERROR, ctx, msg, meta);
    }
    fatal(ctx: string, msg: string, meta?: Record<string, unknown>) {
        this.log(Level.FATAL, ctx, msg, meta);
    }
}
