# @itunified.io/mcp-proxclt

> MCP server for `proxclt` — 25 tools wrapping the Proxmox provisioning CLI via `execFile`

[![npm](https://img.shields.io/npm/v/@itunified.io/mcp-proxclt)](https://www.npmjs.com/package/@itunified.io/mcp-proxclt)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Glama Security](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt/badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt)
[![Glama License](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt/license-badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt)
[![Glama Quality](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt/quality-badge)](https://glama.ai/mcp/servers/@itunified-io/mcp-proxclt)

A thin TypeScript MCP adapter for the [`proxclt`](https://github.com/itunified-io/proxclt) Go binary — an opinionated Proxmox VE provisioning tool that does end-to-end env-driven VM lifecycle, kickstart ISO building, snapshot management, and workflow orchestration.

## Architecture

```
LLM ←→ MCP Protocol ←→ This Adapter ←→ execFile("proxclt ...") ←→ Proxmox VE API
```

- **Layer 0**: `proxclt` Go binary (works without AI)
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
- `proxclt` binary on `PATH` (download from [proxclt releases](https://github.com/itunified-io/proxclt/releases))
- A proxclt environment config (`env.yaml`) and a license at `~/.proxclt/license.jwt`

Override the binary path via `PROXCLT_BINARY` env var if not on `PATH`.

## Installation

```bash
npm install -g @itunified.io/mcp-proxclt
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "proxclt": {
      "command": "npx",
      "args": ["-y", "@itunified.io/mcp-proxclt"]
    }
  }
}
```

## Tool Catalog (25)

| Tool | proxclt | Confirm |
|------|---------|---------|
| `proxclt_config_validate` | `config validate` | none |
| `proxclt_config_render` | `config render` | none |
| `proxclt_vm_create` | `vm create` | standard |
| `proxclt_vm_start` | `vm start` | none |
| `proxclt_vm_stop` | `vm stop` | standard |
| `proxclt_vm_reboot` | `vm reboot` | standard |
| `proxclt_vm_delete` | `vm delete` | double-confirm |
| `proxclt_vm_list` | `vm list` | none |
| `proxclt_vm_status` | `vm status` | none |
| `proxclt_snapshot_create` | `snapshot create` | none |
| `proxclt_snapshot_restore` | `snapshot restore` | standard+echo |
| `proxclt_snapshot_list` | `snapshot list` | none |
| `proxclt_snapshot_delete` | `snapshot delete` | standard |
| `proxclt_kickstart_generate` | `kickstart generate` | none |
| `proxclt_kickstart_build_iso` | `kickstart build-iso` | none |
| `proxclt_kickstart_upload` | `kickstart upload` | none |
| `proxclt_kickstart_distros` | `kickstart distros` | none |
| `proxclt_boot_configure_first_boot` | `boot configure-first-boot` | standard |
| `proxclt_boot_eject_iso` | `boot eject-iso` | none |
| `proxclt_workflow_plan` | `workflow plan` | none |
| `proxclt_workflow_up` | `workflow up` | standard+echo |
| `proxclt_workflow_down` | `workflow down` | double-confirm |
| `proxclt_workflow_status` | `workflow status` | none |
| `proxclt_workflow_verify` | `workflow verify` | none |
| `proxclt_license_status` | `license status` | none |

## Skills

Claude Code skills live in the [proxclt repo](https://github.com/itunified-io/proxclt) under `.claude/skills/` and will be published alongside the 1.0 release.

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
