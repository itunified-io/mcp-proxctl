---
name: proxctl-stack-snapshot
description: Snapshot every VM in a proxctl stack with a common label. Use when user runs /proxctl-stack-snapshot or asks to checkpoint / snapshot a whole proxctl stack.
---

# /proxctl-stack-snapshot

Creates a snapshot on every VM in a stack with a shared name so the stack can be restored as a consistent set.

## Usage

```
/proxctl-stack-snapshot <stack> [name]
```

`name` defaults to `<stack>-<ISO-8601-timestamp>` (e.g. `oracle-rac-uat-2026-04-22T14-30-00Z`).

## Workflow

1. **Preflight**
   - Call `proxctl_config_validate` with `target=<stack>`.
   - Resolve the stack bookmark via `proxctl_stack_show` if a bookmark was passed.
   - Default snapshot name: `<stack>-<ISO-timestamp>` with colons replaced by `-` (Proxmox snapname regex).

2. **Enumerate VMs**
   - Call `proxctl_vm_list` with `target=<stack>`. Filter to VMs tagged with the stack label (the Go binary applies this filter automatically when given a stack target).
   - Echo the VM set + snapshot name to the user and ask for confirmation.

3. **Snapshot loop**
   - For each VM: call `proxctl_snapshot_create` with `target=<stack>`, `name=<vm-name>`, `--snapname=<name>`.
   - Collect pass / fail per VM; do NOT abort on first failure — keep going so partial snapshots can be reconciled.

4. **Report**
   - Emit a table: `<vm> | <snapname> | <ok|error> | <message>`.
   - If any failures, remind the user that the stack is partially snapshotted and recommend either retrying failed VMs or deleting the successful ones to keep the stack consistent.

## Failure Modes

| Failure | Response |
|---------|----------|
| `vm_list` empty | Nothing to snapshot; exit. |
| A VM is off | Proxmox allows offline snapshots; proceed unless user opts out. |
| Partial failure | Report; do not auto-rollback. |

## Example

```
User: /proxctl-stack-snapshot oracle-rac-uat pre-patch
Agent: About to snapshot:
       - rac1  → snapname=pre-patch
       - rac2  → snapname=pre-patch
       Proceed? [y/N]
User: y
Agent:
       | vm   | snapname  | result |
       |------|-----------|--------|
       | rac1 | pre-patch | ok     |
       | rac2 | pre-patch | ok     |
```
