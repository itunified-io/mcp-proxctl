#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BINARY = process.env.PROXCLT_BINARY || "proxclt";

export interface DbxResult {
  success: boolean;
  data: unknown;
  metadata?: { duration_ms: number; target?: string };
}

export interface DbxExecOptions {
  target?: string;
  format?: "json" | "table" | "yaml";
  timeout?: number;
}

/**
 * Execute a `proxclt` command via execFile (no shell, no injection).
 *
 * Maps (domain, action, args) onto the proxclt CLI:
 *   proxclt <domain> <action> [--k v ...] [--target <t>] [--format json]
 *
 * All actual work (Proxmox API calls, license check, audit) is done by
 * the `proxclt` Go binary. This TypeScript layer only handles MCP
 * protocol, Zod schemas, and output shaping.
 */
export async function dbxExec(
  domain: string,
  action: string,
  args: Record<string, string> = {},
  opts: DbxExecOptions = {},
): Promise<DbxResult> {
  const cliArgs: string[] = [];
  if (domain) cliArgs.push(...domain.split(" ").filter(Boolean));
  if (action) cliArgs.push(...action.split(" ").filter(Boolean));

  for (const [k, v] of Object.entries(args)) {
    cliArgs.push(`--${k}`, v);
  }

  if (opts.target) cliArgs.push("--target", opts.target);
  cliArgs.push("--format", opts.format ?? "json");

  const start = Date.now();

  try {
    const { stdout } = await execFileAsync(BINARY, cliArgs, {
      timeout: opts.timeout ?? 120_000,
      maxBuffer: 10 * 1024 * 1024,
    });

    try {
      const parsed = JSON.parse(stdout) as DbxResult;
      if (parsed.metadata) {
        parsed.metadata.duration_ms = Date.now() - start;
      }
      return parsed;
    } catch {
      return {
        success: true,
        data: stdout,
        metadata: { duration_ms: Date.now() - start, target: opts.target },
      };
    }
  } catch (err: unknown) {
    const error = err as { stderr?: string; code?: number; killed?: boolean };

    if (error.killed) {
      return {
        success: false,
        data: { error: "Command timed out", timeout_ms: opts.timeout ?? 120_000 },
      };
    }

    const message = error.stderr?.trim() || `Unknown ${BINARY} error`;
    return {
      success: false,
      data: { error: message, exit_code: error.code ?? 1 },
    };
  }
}
