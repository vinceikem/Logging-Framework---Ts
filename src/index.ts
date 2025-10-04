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
        case Level.DEBUG:
            return chalk.green(Level[level]);
        case Level.INFO:
            return chalk.blue(Level[level]);
        case Level.WARN:
            return chalk.yellow(Level[level]);
        case Level.ERROR:
            return chalk.red(Level[level]);
        case Level.FATAL:
            return chalk.magenta(Level[level]);
    }
}

function prettyPrint(object: object, indent?: number): string {
    let result = "{";
    for (let key of Object.keys(object)) {
        result += `\n${" ".repeat(indent || 2)}${key} : ${
            object[key as keyof object]
        }`;
    }
    result += "\n}";
    return result;
}

export class Logger {
    public env: Env;
    private logFile: string;
    private httpEndpoint?: string;

    constructor(env: Env, httpEndpoint?: string) {
        this.httpEndpoint = httpEndpoint;
        this.env = env;

        // Create logs folder if not exists
        const logDir = path.join(__dirname, "logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        // filename like "Mon_Oct_02_2025.log"
        const fileName = `${new Date().toDateString()}.log`.replace(
            /\s+/g,
            "_"
        );
        this.logFile = path.join(logDir, fileName);
    }

    private async writeToFile(line: string): Promise<void> {
        try {
            await fs.promises.appendFile(this.logFile, line + "\n", "utf-8");
        } catch (err) {
            console.error("Failed to write log to file:", err);
        }
    }

    private async sendToHttp(payload: object): Promise<void> {
        try {
            await axios.post(this.httpEndpoint!, payload);
        } catch (error) {
            console.error("Failed to send log file");
        }
    }

    private log(
        level: Level,
        context: string,
        message: string,
        metadata?: object
    ): void {
        const timestamp = new Date().toISOString();
        const payload = {
            level: Level[level],
            timestamp,
            context,
            message,
            metadata: metadata || null,
        };

        // console (colored)
        console.log(
            `[${color(level)}]: ${timestamp} - ${chalk.yellow(
                context
            )} - ${message}${
                metadata ? `\n${chalk.cyanBright(prettyPrint(metadata))}` : ""
            }`
        );

        // file (async, non-blocking)
        this.writeToFile(JSON.stringify(payload));

        if (!!this.httpEndpoint) {
            this.sendToHttp(payload);
        }
    }

    debug(context: string, message: string, meta?: object): void {
        if (this.env === "dev") this.log(Level.DEBUG, context, message, meta);
    }

    info(context: string, message: string, meta?: object): void {
        if (this.env === "dev") this.log(Level.INFO, context, message, meta);
    }

    warn(context: string, message: string, meta?: object): void {
        this.log(Level.WARN, context, message, meta);
    }

    error(context: string, message: string, meta?: object): void {
        this.log(Level.ERROR, context, message, meta);
    }

    fatal(context: string, message: string, meta?: object): void {
        this.log(Level.FATAL, context, message, meta);
    }
}

const logger = new Logger("prod");

logger.info("Order", "Order created", { id: 1, status: "pending" });
logger.error("Order", "Failed to update order", { id: 1, reason: "DB error" });
