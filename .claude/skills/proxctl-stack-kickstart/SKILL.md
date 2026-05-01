---
name: proxctl-stack-kickstart
description: Regenerate + rebuild + re-upload kickstart ISOs for every node in a proxctl stack without touching running VMs. Use when user runs /proxctl-stack-kickstart or asks to rebuild / regen kickstart ISOs for a proxctl stack.
---

# /proxctl-stack-kickstart

Iteration aid for kickstart authoring: regenerates the kickstart file, builds the ISO, and uploads it to Proxmox storage for every node in the stack. Does NOT create, stop, or modify any VM.

## Usage

```
/proxctl-stack-kickstart <stack>
```

## Workflow

1. **Preflight**
   - Call `proxctl_config_validate` with `target=<stack>` to ensure `env.yaml` + `linux.yaml` + `hypervisor.yaml` parse.
   - Resolve the stack bookmark via `proxctl_stack_show` if a bookmark was passed.
   - List supported distros via `proxctl_kickstart_distros` for reference.

2. **For each node in the stack**
   1. `proxctl_kickstart_generate` — render the kickstart/autoinstall file from env config.
   2. **REQUIRED: validate ks.cfg has `--ignoremissing` on `%packages`** (per `/lab-up` Rule 5: anaconda hangs on missing packages without this flag — caught in proxctl#39 v2026.04.30.2). If absent: hard-fail this node, do not build the ISO.
   3. `proxctl_kickstart_build_iso` — embed the kickstart file into a bootable ISO.
   4. **REQUIRED: post-build OEMDRV-label check.** Anaconda only auto-discovers kickstart from a CD with volume label `OEMDRV` (case-sensitive). If the built ISO has any other volume label (`KS_<HOST>`, `kickstart`, etc.), Anaconda silently falls back to the interactive language menu — install hangs forever. Verify via `xorriso -indev <iso> | grep "Volume id"` or `blkid` on the file. If label != `OEMDRV`: hard-fail this node, do not upload.
   5. **Upload via canonical MCP path.** Prefer `proxmox_storage_upload` from mcp-proxmox-enterprise v2026.04.30.2+ (closes lab-up Rule 3 gap, no proxctl API creds needed). Fall back to `proxctl_kickstart_upload` only if that MCP tool is unavailable. **DO NOT** fall through to ad-hoc curl/scp — yesterday's session reused stale ISOs with wrong volid because there was no canonical path; that bug is closed.
   - Collect pass / fail per node; continue on failure.

3. **Report**
   - Emit a table: `<node> | <distro> | <iso path> | <volid label> | <storage volid> | <ok|error>`.
   - Remind the user this skill does NOT re-boot any VM — use `/proxctl-stack-up` or `proxctl_boot_configure_first_boot` to actually pick up the new ISO.

## Constraints

- **No VM mutation** — this skill MUST NOT call any `proxctl_vm_*` or `proxctl_workflow_*` tool.
- **No reuse of existing kickstart ISOs without verification.** If an existing ISO is on the storage with the same volid, fetch its volume label via `proxmox_ssh_exec` (or equivalent). Only skip rebuild if BOTH the volume label is `OEMDRV` AND the ks.cfg content matches the freshly-rendered output. Otherwise rebuild.
- Fresh ISOs overwrite the previous upload at the same storage path. That is the intended iteration behaviour.

## Failure Modes

| Failure | Response |
|---------|----------|
| `kickstart_generate` fails | Print the template error; skip build/upload for that node. |
| `%packages --ignoremissing` missing from rendered ks.cfg | **Hard fail this node** — Rule 5 violation. Surface a clear error pointing operator at the kickstart template. |
| `build_iso` fails | Surface the mkisofs/xorriso error; continue with other nodes. |
| Built ISO volume label != `OEMDRV` | **Hard fail this node.** This was the dbx-control 2026-04-30 / ext3+ext4 2026-05-01 hang bug. The xorriso command must use `-volid OEMDRV` exactly. |
| `upload` fails | Most often auth or storage-full; surface the error; continue. |

## Example

```
User: /proxctl-stack-kickstart oracle-rac-uat
Agent:
       | node | distro    | iso                              | storage           | result |
       |------|-----------|----------------------------------|-------------------|--------|
       | rac1 | rocky-9.4 | /tmp/proxctl/rac1-ks.iso         | iso-store:iso/... | ok     |
       | rac2 | rocky-9.4 | /tmp/proxctl/rac2-ks.iso         | iso-store:iso/... | ok     |
       Next step: /proxctl-stack-up oracle-rac-uat (re-boots VMs off the new ISO)
```

## Plan RAG (infrastructure ADR-0096 v3)

This skill follows the canonical plan template documented in
`itunified-io/infrastructure/.claude/skills/_shared/PLAN_TEMPLATE.md`:

- Enter plan mode first (`EnterPlanMode`); write the canonical plan
  to the active session plan file; call `ExitPlanMode` and wait for
  operator approval before any state-changing tool runs.
- Reset TodoWrite at start with all planned steps as `pending`.
- Use shared step IDs across all 3 surfaces:
  - Plan file row: `| 5 | <name> | 🔄 | <detail> |`
  - TodoWrite: `"/<skill> step 5 — <name>"`
  - Bash description: `"[/<skill> step 5] <imperative>"`
- When invoked from a parent orchestrator (`/lab-up`, etc.), this
  skill's step IDs append to the parent's:
  `"[/lab-up step 3 / proxctl-stack-up step 2] …"`.
- Update the session plan file in place at every phase boundary +
  material side effect; mirror to `~/.lab/<skill>/plan-current.md`.
