# Changelog

All notable changes to this project will be documented in this file.

## v2026.05.01.1 — 2026-05-01

### docs(skill): proxctl-stack-kickstart hardening — OEMDRV-label + --ignoremissing checks (#6)

Hardens the `/proxctl-stack-kickstart` skill against the failure mode caught
during `/lab-up` runs on 2026-04-30 (dbx-control) and 2026-05-01 (ext3+ext4):
agent fell through canonical proxctl tools to ad-hoc xorriso, accidentally
labeling the ISO `KS_<HOST>` instead of `OEMDRV`. Anaconda only auto-discovers
kickstart from `OEMDRV`-labeled CDs, so install silently hung at the language
menu.

Skill changes:
- **Required pre-build check**: validate rendered ks.cfg has `%packages
  --ignoremissing` (per lab-up Rule 5). Hard-fail node if missing.
- **Required post-build check**: validate built ISO volume label == `OEMDRV`
  before upload. Hard-fail node otherwise.
- **Upload path**: prefer `proxmox_storage_upload` from mcp-proxmox-enterprise
  v2026.04.30.2+ (canonical MCP path; no proxctl API creds needed). Fall back
  to `proxctl_kickstart_upload` only if MCP unavailable. **Never** fall
  through to ad-hoc curl/scp.
- **Reuse policy**: never reuse an existing storage-side ISO without verifying
  volume label + ks.cfg content match the fresh render.

## v2026.04.11.4 — 2026-04-22

### Changed (BREAKING)
- Tool prefix: `proxctl_env_*` → `proxctl_stack_*` (7 tools) — matches upstream proxctl v2026.04.11.8 CLI rename

### Added — /stack-* skills
- /proxctl-stack-up, /proxctl-stack-down, /proxctl-stack-snapshot, /proxctl-stack-kickstart

## v2026.04.11.3 — 2026-04-19

### Added — Phase 6 (#2)
- Tool: `proxctl_workflow_profile_list` — list shipped profiles (oracle-rac-2node, pg-single, host-only)
- Tool: `proxctl_workflow_profile_show` — print a shipped profile's YAML content
- Matches proxctl v2026.04.11.6 (MultiNodeWorkflow + profile library)

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
