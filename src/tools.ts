import { z } from "zod";
import type { ToolDefinition } from "./plugin.js";

// ─── proxclt tools (25) ─────────────────────────────────────────────
// Each tool maps 1:1 to a `proxclt <domain> <action>` subcommand.
// `target` is the env name (or path to env.yaml) for the workflow.

const target = z
  .string()
  .describe("Environment name or path to env.yaml for the proxclt workflow");

const name = z
  .string()
  .optional()
  .describe("Resource name (VM, snapshot, ISO, etc.) — optional context");

const baseSchema = { target, name };

export const tools: ToolDefinition[] = [
  // config
  {
    name: "proxclt_config_validate",
    description: "Validate a proxclt environment config (env.yaml)",
    inputSchema: { target },
    domain: "config",
    action: "validate",
  },
  {
    name: "proxclt_config_render",
    description: "Render the effective proxclt environment config",
    inputSchema: { target },
    domain: "config",
    action: "render",
  },

  // vm
  {
    name: "proxclt_vm_create",
    description: "Create a VM from the env config (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "create",
  },
  {
    name: "proxclt_vm_start",
    description: "Start a VM",
    inputSchema: baseSchema,
    domain: "vm",
    action: "start",
  },
  {
    name: "proxclt_vm_stop",
    description: "Stop a VM gracefully (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "stop",
  },
  {
    name: "proxclt_vm_reboot",
    description: "Reboot a VM (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "reboot",
  },
  {
    name: "proxclt_vm_delete",
    description: "Delete a VM and its disks (double-confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "delete",
  },
  {
    name: "proxclt_vm_list",
    description: "List VMs in the environment",
    inputSchema: { target },
    domain: "vm",
    action: "list",
  },
  {
    name: "proxclt_vm_status",
    description: "Show detailed VM status",
    inputSchema: baseSchema,
    domain: "vm",
    action: "status",
  },

  // snapshot
  {
    name: "proxclt_snapshot_create",
    description: "Create a VM snapshot",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "create",
  },
  {
    name: "proxclt_snapshot_restore",
    description: "Restore a VM from a snapshot (standard+echo confirm)",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "restore",
  },
  {
    name: "proxclt_snapshot_list",
    description: "List snapshots for a VM",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "list",
  },
  {
    name: "proxclt_snapshot_delete",
    description: "Delete a VM snapshot (standard confirm)",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "delete",
  },

  // kickstart
  {
    name: "proxclt_kickstart_generate",
    description: "Generate a kickstart/autoinstall file from env config",
    inputSchema: { target },
    domain: "kickstart",
    action: "generate",
  },
  {
    name: "proxclt_kickstart_build_iso",
    description: "Build an ISO embedding the kickstart file",
    inputSchema: { target },
    domain: "kickstart",
    action: "build-iso",
  },
  {
    name: "proxclt_kickstart_upload",
    description: "Upload the built ISO to a Proxmox storage",
    inputSchema: { target },
    domain: "kickstart",
    action: "upload",
  },
  {
    name: "proxclt_kickstart_distros",
    description: "List supported kickstart distros/templates",
    inputSchema: {},
    domain: "kickstart",
    action: "distros",
  },

  // boot
  {
    name: "proxclt_boot_configure_first_boot",
    description: "Configure first-boot sequence (ISO boot order) (standard confirm)",
    inputSchema: baseSchema,
    domain: "boot",
    action: "configure-first-boot",
  },
  {
    name: "proxclt_boot_eject_iso",
    description: "Eject the install ISO after provisioning completes",
    inputSchema: baseSchema,
    domain: "boot",
    action: "eject-iso",
  },

  // workflow
  {
    name: "proxclt_workflow_plan",
    description: "Show the end-to-end provisioning plan for an environment",
    inputSchema: { target },
    domain: "workflow",
    action: "plan",
  },
  {
    name: "proxclt_workflow_up",
    description: "Run the full environment provisioning workflow (standard+echo)",
    inputSchema: { target },
    domain: "workflow",
    action: "up",
  },
  {
    name: "proxclt_workflow_down",
    description: "Tear down an environment (double-confirm)",
    inputSchema: { target },
    domain: "workflow",
    action: "down",
  },
  {
    name: "proxclt_workflow_status",
    description: "Show current workflow / environment status",
    inputSchema: { target },
    domain: "workflow",
    action: "status",
  },
  {
    name: "proxclt_workflow_verify",
    description: "Verify environment matches desired state",
    inputSchema: { target },
    domain: "workflow",
    action: "verify",
  },

  // license
  {
    name: "proxclt_license_status",
    description: "Show current proxclt license status",
    inputSchema: {},
    domain: "license",
    action: "status",
  },
];
