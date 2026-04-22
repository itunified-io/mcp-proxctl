#!/usr/bin/env node
import { createMcpRuntime } from "./runtime.js";
import { createPlugin } from "./plugin.js";
import { tools } from "./tools.js";

const pkg = {
  name: "mcp-proxctl",
  version: "2026.4.11-1",
};

const useSSE = process.argv.includes("--sse");
const port = parseInt(process.env.MCP_PORT ?? "3101", 10);

const runtime = createMcpRuntime({
  name: pkg.name,
  version: pkg.version,
  transport: useSSE ? "sse" : "stdio",
  port,
});

// Self-register: standalone mode (proxctl domain)
const plugin = createPlugin({
  name: "proxctl",
  domain: "proxctl",
  requiredBundle: "free",
  tools,
});

plugin.register(runtime);

// Start the server
runtime.start().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
