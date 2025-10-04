# Logging Framework

A simple TypeScript logging framework for Node.js with support for console, file, and HTTP logging.

## Features

- Log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
- Colored console output
- Daily log file creation
- Optional HTTP endpoint for remote logging
- Environment-based logging (`dev` or `prod`)

## Installation

```sh
npm install
```

## Usage

```typescript
import { Logger } from "./src/index";

// Create a logger instance
const logger = new Logger("prod", "https://your-endpoint.com/logs");

// Log messages
logger.info("Order", "Order created", { id: 1, status: "pending" });
logger.error("Order", "Failed to update order", { id: 1, reason: "DB error" });
logger.warn("Order", "Order delayed", { id: 1, reason: "Out of stock" });
logger.debug("Order", "Debugging order flow", { id: 1 });
logger.fatal("Order", "System crash", { id: 1, reason: "Unknown" });
```

## Log Files

- Log files are created daily in the `logs` folder.
- Each log entry is saved as a JSON string.

## HTTP Logging

- Pass an HTTP endpoint as the second argument to the `Logger` constructor.
- Each log entry will be sent as a POST request to the endpoint.

## Testing

Run unit tests with:

```sh
npm test
```

## License

MIT