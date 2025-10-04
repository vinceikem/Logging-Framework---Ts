import { Logger } from "./index";

// Dev environment: DEBUG and INFO will log
const devLogger = new Logger("dev");
devLogger.debug("DevContext", "Debug message", { foo: "bar" });
devLogger.info("DevContext", "Info message", { foo: "bar" });
devLogger.warn("DevContext", "Warn message", { foo: "bar" });
devLogger.error("DevContext", "Error message", { foo: "bar" });
devLogger.fatal("DevContext", "Fatal message", { foo: "bar" });

// Prod environment: only WARN, ERROR, FATAL will log
const prodLogger = new Logger("prod");
prodLogger.debug("ProdContext", "Debug message", { foo: "bar" }); // will NOT log
prodLogger.info("ProdContext", "Info message", { foo: "bar" });   // will NOT log
prodLogger.warn("ProdContext", "Warn message", { foo: "bar" });
prodLogger.error("ProdContext", "Error message", { foo: "bar" });
prodLogger.fatal("ProdContext", "Fatal message", { foo: "bar" });