import { z } from "zod";
import type { ToolDefinition } from "./plugin.js";

// ─── proxctl tools (34) ─────────────────────────────────────────────
// Each tool maps 1:1 to a `proxctl <domain> <action>` subcommand.
// `target` is the stack/env name (or path to env.yaml) for the workflow.

const target = z
  .string()
  .describe("Stack name or path to env.yaml for the proxctl workflow");

const name = z
  .string()
  .optional()
  .describe("Resource name (VM, snapshot, ISO, etc.) — optional context");

const baseSchema = { target, name };

const stackName = z
  .string()
  .describe("Stack bookmark name (entry in ~/.proxctl/stacks.yaml)");

const stackNameOptional = z
  .string()
  .optional()
  .describe("Stack bookmark name (optional — defaults to current stack)");

export const tools: ToolDefinition[] = [
  // stack (bookmark management, matches proxctl v2026.04.11.8 stack verb)
  {
    name: "proxctl_stack_new",
    description: "Scaffold a new stack directory (env.yaml + layer files)",
    inputSchema: { name: stackName },
    domain: "stack",
    action: "new",
  },
  {
    name: "proxctl_stack_list",
    description: "List bookmarked stacks from ~/.proxctl/stacks.yaml",
    inputSchema: {},
    domain: "stack",
    action: "list",
  },
  {
    name: "proxctl_stack_use",
    description: "Switch the current stack bookmark",
    inputSchema: { name: stackName },
    domain: "stack",
    action: "use",
  },
  {
    name: "proxctl_stack_current",
    description: "Print the currently selected stack bookmark",
    inputSchema: {},
    domain: "stack",
    action: "current",
  },
  {
    name: "proxctl_stack_add",
    description: "Bookmark a stack (local path or git ref) in ~/.proxctl/stacks.yaml",
    inputSchema: { name: stackName },
    domain: "stack",
    action: "add",
  },
  {
    name: "proxctl_stack_remove",
    description: "Remove a stack bookmark from ~/.proxctl/stacks.yaml",
    inputSchema: { name: stackName },
    domain: "stack",
    action: "remove",
  },
  {
    name: "proxctl_stack_show",
    description: "Show resolved paths + sha of a stack bookmark",
    inputSchema: { name: stackNameOptional },
    domain: "stack",
    action: "show",
  },

  // config
  {
    name: "proxctl_config_validate",
    description: "Validate a proxctl environment config (env.yaml)",
    inputSchema: { target },
    domain: "config",
    action: "validate",
  },
  {
    name: "proxctl_config_render",
    description: "Render the effective proxctl environment config",
    inputSchema: { target },
    domain: "config",
    action: "render",
  },

  // vm
  {
    name: "proxctl_vm_create",
    description: "Create a VM from the env config (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "create",
  },
  {
    name: "proxctl_vm_start",
    description: "Start a VM",
    inputSchema: baseSchema,
    domain: "vm",
    action: "start",
  },
  {
    name: "proxctl_vm_stop",
    description: "Stop a VM gracefully (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "stop",
  },
  {
    name: "proxctl_vm_reboot",
    description: "Reboot a VM (standard confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "reboot",
  },
  {
    name: "proxctl_vm_delete",
    description: "Delete a VM and its disks (double-confirm)",
    inputSchema: baseSchema,
    domain: "vm",
    action: "delete",
  },
  {
    name: "proxctl_vm_list",
    description: "List VMs in the environment",
    inputSchema: { target },
    domain: "vm",
    action: "list",
  },
  {
    name: "proxctl_vm_status",
    description: "Show detailed VM status",
    inputSchema: baseSchema,
    domain: "vm",
    action: "status",
  },

  // snapshot
  {
    name: "proxctl_snapshot_create",
    description: "Create a VM snapshot",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "create",
  },
  {
    name: "proxctl_snapshot_restore",
    description: "Restore a VM from a snapshot (standard+echo confirm)",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "restore",
  },
  {
    name: "proxctl_snapshot_list",
    description: "List snapshots for a VM",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "list",
  },
  {
    name: "proxctl_snapshot_delete",
    description: "Delete a VM snapshot (standard confirm)",
    inputSchema: baseSchema,
    domain: "snapshot",
    action: "delete",
  },

  // kickstart
  {
    name: "proxctl_kickstart_generate",
    description: "Generate a kickstart/autoinstall file from env config",
    inputSchema: { target },
    domain: "kickstart",
    action: "generate",
  },
  {
    name: "proxctl_kickstart_build_iso",
    description: "Build an ISO embedding the kickstart file",
    inputSchema: { target },
    domain: "kickstart",
    action: "build-iso",
  },
  {
    name: "proxctl_kickstart_upload",
    description: "Upload the built ISO to a Proxmox storage",
    inputSchema: { target },
    domain: "kickstart",
    action: "upload",
  },
  {
    name: "proxctl_kickstart_distros",
    description: "List supported kickstart distros/templates",
    inputSchema: {},
    domain: "kickstart",
    action: "distros",
  },

  // boot
  {
    name: "proxctl_boot_configure_first_boot",
    description: "Configure first-boot sequence (ISO boot order) (standard confirm)",
    inputSchema: baseSchema,
    domain: "boot",
    action: "configure-first-boot",
  },
  {
    name: "proxctl_boot_eject_iso",
    description: "Eject the install ISO after provisioning completes",
    inputSchema: baseSchema,
    domain: "boot",
    action: "eject-iso",
  },

  // workflow
  {
    name: "proxctl_workflow_plan",
    description: "Show the end-to-end provisioning plan for an environment",
    inputSchema: { target },
    domain: "workflow",
    action: "plan",
  },
  {
    name: "proxctl_workflow_up",
    description: "Run the full environment provisioning workflow (standard+echo)",
    inputSchema: { target },
    domain: "workflow",
    action: "up",
  },
  {
    name: "proxctl_workflow_down",
    description: "Tear down an environment (double-confirm)",
    inputSchema: { target },
    domain: "workflow",
    action: "down",
  },
  {
    name: "proxctl_workflow_status",
    description: "Show current workflow / environment status",
    inputSchema: { target },
    domain: "workflow",
    action: "status",
  },
  {
    name: "proxctl_workflow_verify",
    description: "Verify environment matches desired state",
    inputSchema: { target },
    domain: "workflow",
    action: "verify",
  },

  {
    name: "proxctl_workflow_profile_list",
    description: "List shipped workflow profiles (oracle-rac-2node, pg-single, host-only)",
    inputSchema: {},
    domain: "workflow",
    action: "profile list",
  },
  {
    name: "proxctl_workflow_profile_show",
    description: "Print a shipped workflow profile's YAML content",
    inputSchema: { name: z.string().describe("Profile name (e.g. oracle-rac-2node)") },
    domain: "workflow",
    action: "profile show",
  },

  // license
  {
    name: "proxctl_license_status",
    description: "Show current proxctl license status",
    inputSchema: {},
    domain: "license",
    action: "status",
  },
];
