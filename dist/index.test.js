"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// Import Logger and Level from your module
const index_1 = require("./index"); // Adjust import if needed
describe("Logger", () => {
    let logger;
    let consoleSpy;
    let fsSpy;
    beforeEach(() => {
        logger = new index_1.Logger("dev");
        consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        fsSpy = jest.spyOn(fs_1.default.promises, "appendFile").mockResolvedValue(undefined);
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
        const prodLogger = new index_1.Logger("prod");
        prodLogger.info("ProdCtx", "Should not log");
        expect(consoleSpy).not.toHaveBeenCalled();
        expect(fsSpy).not.toHaveBeenCalled();
    });
});
