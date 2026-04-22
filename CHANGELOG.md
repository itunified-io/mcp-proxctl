# Changelog

All notable changes to this project will be documented in this file.

## v2026.04.11.2 — 2026-04-22

### Changed (BREAKING)
- Renamed MCP server from mcp-proxclt → mcp-proxctl (matches upstream CLI rename)
- npm package: `@itunified.io/mcp-proxctl`
- Tool prefix: `proxctl_*` (was `proxclt_*`) — 25 tools renamed
- Binary wrapped: `proxctl` (was `proxclt`)
- Env var: `PROXCTL_BINARY` (was `PROXCLT_BINARY`)

## v2026.04.11.1 — 2026-04-22

Initial scaffold. 25 tools wrapping the `proxclt` Proxmox provisioning CLI via `execFile`.

- `proxclt_config_validate`, `proxclt_config_render`
- `proxclt_vm_create`, `proxclt_vm_start`, `proxclt_vm_stop`, `proxclt_vm_reboot`, `proxclt_vm_delete`, `proxclt_vm_list`, `proxclt_vm_status`
- `proxclt_snapshot_create`, `proxclt_snapshot_restore`, `proxclt_snapshot_list`, `proxclt_snapshot_delete`
- `proxclt_kickstart_generate`, `proxclt_kickstart_build_iso`, `proxclt_kickstart_upload`, `proxclt_kickstart_distros`
- `proxclt_boot_configure_first_boot`, `proxclt_boot_eject_iso`
- `proxclt_workflow_plan`, `proxclt_workflow_up`, `proxclt_workflow_down`, `proxclt_workflow_status`, `proxclt_workflow_verify`
- `proxclt_license_status`

Phase 1 of the proxclt + linuxctl plan. Closes #1.
Ref: itunified-io/infrastructure#389
See: infrastructure/docs/plans/024-proxclt-design.md
