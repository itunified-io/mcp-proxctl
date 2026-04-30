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
   2. `proxctl_kickstart_build_iso` — embed the kickstart file into a bootable ISO.
   3. `proxctl_kickstart_upload` — upload the built ISO to the Proxmox storage configured in `env.yaml`.
   - Collect pass / fail per node; continue on failure.

3. **Report**
   - Emit a table: `<node> | <distro> | <iso path> | <storage volid> | <ok|error>`.
   - Remind the user this skill does NOT re-boot any VM — use `/proxctl-stack-up` or `proxctl_boot_configure_first_boot` to actually pick up the new ISO.

## Constraints

- **No VM mutation** — this skill MUST NOT call any `proxctl_vm_*` or `proxctl_workflow_*` tool.
- Fresh ISOs overwrite the previous upload at the same storage path. That is the intended iteration behaviour.

## Failure Modes

| Failure | Response |
|---------|----------|
| `kickstart_generate` fails | Print the template error; skip build/upload for that node. |
| `build_iso` fails | Surface the mkisofs/xorriso error; continue with other nodes. |
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
