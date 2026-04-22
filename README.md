# @itunified.io/mcp-proxctl

> MCP server for `proxctl` — 27 tools wrapping the Proxmox provisioning CLI via `execFile`

[![npm](https://img.shields.io/npm/v/@itunified.io/mcp-proxctl)](https://www.npmjs.com/package/@itunified.io/mcp-proxctl)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Glama Security](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl/badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl)
[![Glama License](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl/license-badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl)
[![Glama Quality](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl/quality-badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxctl)

A thin TypeScript MCP adapter for the [`proxctl`](https://github.com/itunified-io/proxctl) Go binary — an opinionated Proxmox VE provisioning tool that does end-to-end env-driven VM lifecycle, kickstart ISO building, snapshot management, and workflow orchestration.

## Architecture

```
LLM ←→ MCP Protocol ←→ This Adapter ←→ execFile("proxctl ...") ←→ Proxmox VE API
```

- **Layer 0**: `proxctl` Go binary (works without AI)
- **Layer 1**: This MCP adapter (TypeScript, Zod schemas, MCP protocol)
- **Layer 2**: AI skills (Claude Code, IDE integrations)

All mutating operations are guarded by confirm levels enforced by the Go binary:

| Confirm level | Tools |
|---------------|-------|
| none          | list / status / plan / validate / render / distros / kickstart_* (pre-apply) |
| standard      | vm_create, vm_stop, vm_reboot, snapshot_delete, boot_configure_first_boot |
| standard+echo | snapshot_restore, workflow_up |
| double-confirm| vm_delete, workflow_down |

## Prerequisites

- Node.js ≥ 20
- `proxctl` binary on `PATH` (download from [proxctl releases](https://github.com/itunified-io/proxctl/releases))
- A proxctl environment config (`env.yaml`) and a license at `~/.proxctl/license.jwt`

Override the binary path via `PROXCTL_BINARY` env var if not on `PATH`.

## Installation

```bash
npm install -g @itunified.io/mcp-proxctl
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "proxctl": {
      "command": "npx",
      "args": ["-y", "@itunified.io/mcp-proxctl"]
    }
  }
}
```

## Tool Catalog (27)

| Tool | proxctl | Confirm |
|------|---------|---------|
| `proxctl_config_validate` | `config validate` | none |
| `proxctl_config_render` | `config render` | none |
| `proxctl_vm_create` | `vm create` | standard |
| `proxctl_vm_start` | `vm start` | none |
| `proxctl_vm_stop` | `vm stop` | standard |
| `proxctl_vm_reboot` | `vm reboot` | standard |
| `proxctl_vm_delete` | `vm delete` | double-confirm |
| `proxctl_vm_list` | `vm list` | none |
| `proxctl_vm_status` | `vm status` | none |
| `proxctl_snapshot_create` | `snapshot create` | none |
| `proxctl_snapshot_restore` | `snapshot restore` | standard+echo |
| `proxctl_snapshot_list` | `snapshot list` | none |
| `proxctl_snapshot_delete` | `snapshot delete` | standard |
| `proxctl_kickstart_generate` | `kickstart generate` | none |
| `proxctl_kickstart_build_iso` | `kickstart build-iso` | none |
| `proxctl_kickstart_upload` | `kickstart upload` | none |
| `proxctl_kickstart_distros` | `kickstart distros` | none |
| `proxctl_boot_configure_first_boot` | `boot configure-first-boot` | standard |
| `proxctl_boot_eject_iso` | `boot eject-iso` | none |
| `proxctl_workflow_plan` | `workflow plan` | none |
| `proxctl_workflow_up` | `workflow up` | standard+echo |
| `proxctl_workflow_down` | `workflow down` | double-confirm |
| `proxctl_workflow_status` | `workflow status` | none |
| `proxctl_workflow_verify` | `workflow verify` | none |
| `proxctl_workflow_profile_list` | `workflow profile list` | none |
| `proxctl_workflow_profile_show` | `workflow profile show` | none |
| `proxctl_license_status` | `license status` | none |

## Skills

Claude Code skills live in the [proxctl repo](https://github.com/itunified-io/proxctl) under `.claude/skills/` and will be published alongside the 1.0 release.

## Development

```bash
npm install
npm run build
npm run lint
```

## License

AGPL-3.0 — see [LICENSE](LICENSE).

---

Built by [ITUNIFIED GmbH](https://itunified.io)
