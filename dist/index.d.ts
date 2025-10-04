declare enum Level {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
type Env = "dev" | "prod";
export declare class Logger {
    private env;
    private logFile;
    private httpEndpoint?;
    private minLevel;
    constructor(env: Env, httpEndpoint?: string, minLevel?: Level);
    private writeToFile;
    private sendToHttp;
    private shouldLog;
    private log;
    debug(ctx: string, msg: string, meta?: Record<string, unknown>): void;
    info(ctx: string, msg: string, meta?: Record<string, unknown>): void;
    warn(ctx: string, msg: string, meta?: Record<string, unknown>): void;
    error(ctx: string, msg: string, meta?: Record<string, unknown>): void;
    fatal(ctx: string, msg: string, meta?: Record<string, unknown>): void;
}
export {};
