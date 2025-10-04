"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
var Level;
(function (Level) {
    Level[Level["DEBUG"] = 0] = "DEBUG";
    Level[Level["INFO"] = 1] = "INFO";
    Level[Level["WARN"] = 2] = "WARN";
    Level[Level["ERROR"] = 3] = "ERROR";
    Level[Level["FATAL"] = 4] = "FATAL";
})(Level || (Level = {}));
function color(level) {
    switch (level) {
        case Level.DEBUG: return chalk_1.default.green(Level[level]);
        case Level.INFO: return chalk_1.default.blue(Level[level]);
        case Level.WARN: return chalk_1.default.yellow(Level[level]);
        case Level.ERROR: return chalk_1.default.red(Level[level]);
        case Level.FATAL: return chalk_1.default.magenta(Level[level]);
        default: return Level[level];
    }
}
function prettyPrint(object, indent = 2) {
    let result = "{";
    for (const key of Object.keys(object)) {
        result += `\n${" ".repeat(indent)}${key}: ${object[key]}`;
    }
    return result + "\n}";
}
class Logger {
    env;
    logFile;
    httpEndpoint;
    minLevel;
    constructor(env, httpEndpoint, minLevel = Level.WARN) {
        this.env = env;
        this.httpEndpoint = httpEndpoint;
        this.minLevel = env === "dev" ? Level.DEBUG : minLevel;
        // Ensure logs directory
        const logDir = path_1.default.join(__dirname, "logs");
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir);
        }
        // Daily log file: 2025-10-03.log
        const fileName = `${new Date().toISOString().split("T")[0]}.log`;
        this.logFile = path_1.default.join(logDir, fileName);
    }
    async writeToFile(line) {
        try {
            await fs_1.default.promises.appendFile(this.logFile, line + "\n", "utf-8");
        }
        catch (err) {
            console.error("File log failed:", err.message);
        }
    }
    async sendToHttp(payload) {
        try {
            if (this.httpEndpoint) {
                await axios_1.default.post(this.httpEndpoint, payload);
            }
        }
        catch (err) {
            console.error("HTTP log failed:", err.message);
        }
    }
    shouldLog(level) {
        return level >= this.minLevel;
    }
    async log(level, context, message, metadata) {
        if (!this.shouldLog(level))
            return;
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
            console.log(`[${color(level)}] ${timestamp} - ${chalk_1.default.yellow(context)} - ${message}${metadata ? `\n${chalk_1.default.cyanBright(prettyPrint(metadata))}` : ""}`);
        }
        else {
            console.log(formatted);
        }
        // File logging (structured JSON)
        await this.writeToFile(JSON.stringify(payload));
        // Remote logging
        if (this.httpEndpoint) {
            await this.sendToHttp(payload);
        }
    }
    debug(ctx, msg, meta) {
        this.log(Level.DEBUG, ctx, msg, meta);
    }
    info(ctx, msg, meta) {
        this.log(Level.INFO, ctx, msg, meta);
    }
    warn(ctx, msg, meta) {
        this.log(Level.WARN, ctx, msg, meta);
    }
    error(ctx, msg, meta) {
        this.log(Level.ERROR, ctx, msg, meta);
    }
    fatal(ctx, msg, meta) {
        this.log(Level.FATAL, ctx, msg, meta);
    }
}
exports.Logger = Logger;
