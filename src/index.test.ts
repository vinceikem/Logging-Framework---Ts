import fs from "fs";
import path from "path";

// Import Logger and Level from your module
import { Logger } from "./index"; // Adjust import if needed

describe("Logger", () => {
    let logger: Logger;
    let consoleSpy: jest.SpyInstance;
    let fsSpy: jest.SpyInstance;

    beforeEach(() => {
        logger = new Logger("dev");
        consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        fsSpy = jest.spyOn(fs.promises, "appendFile").mockResolvedValue(undefined as any);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        fsSpy.mockRestore();
    });

    test("info logs to console and file", () => {
        logger.info("TestContext", "Test message", { foo: "bar" });
        expect(consoleSpy).toHaveBeenCalled();
        expect(fsSpy).toHaveBeenCalled();
    });

    test("error logs to console and file", () => {
        logger.error("ErrCtx", "Something went wrong", { code: 500 });
        expect(consoleSpy).toHaveBeenCalled();
        expect(fsSpy).toHaveBeenCalled();
    });

    test("debug only logs in dev", () => {
        logger.debug("DebugCtx", "Debugging", { debug: true });
        expect(consoleSpy).toHaveBeenCalled();
        expect(fsSpy).toHaveBeenCalled();
    });

    test("info does not log in prod", () => {
        const prodLogger = new Logger("prod");
        prodLogger.info("ProdCtx", "Should not log");
        expect(consoleSpy).not.toHaveBeenCalled();
        expect(fsSpy).not.toHaveBeenCalled();
    });
});
