---
name: proxctl-stack-down
description: Tear down every VM in a proxctl stack (double-confirm, verify, cleanup kickstart ISOs). Use when user runs /proxctl-stack-down or asks to destroy / tear down / decommission / wipe a proxctl stack.
---

# /proxctl-stack-down

Destructive operation: removes every VM belonging to a proxctl stack and any leftover kickstart ISOs. Double-confirmed both at the skill and binary layers.

## Usage

```
/proxctl-stack-down <stack>
```

## Workflow

1. **Preflight — double-confirm with the user**
   - Restate the stack name + resolved path + sha (via `proxctl_stack_show` if bookmark).
   - Call `proxctl_vm_list` with `target=<stack>` and show every VM about to be destroyed (vmid, name, status).
   - Require the user to type the stack name back verbatim. Anything else → abort.

2. **Tear down**
   - Call `proxctl_workflow_down` with `target=<stack>` (the Go binary also enforces a double-confirm; answer it via its `--yes` flag semantics — we pass through because the skill already confirmed).
   - Do NOT loop per-VM; the workflow handles ordering (stop → delete → release storage).

3. **Verify**
   - Call `proxctl_vm_list` with `target=<stack>` again. Expect an empty set.
   - If any VM remains: list them, call `proxctl_vm_delete` (double-confirm) per leftover, then re-verify.

4. **Cleanup kickstart ISOs**
   - The kickstart ISOs uploaded during provisioning are not auto-removed. Enumerate them from `proxctl_kickstart_distros` + the `target` stack and ask the user whether to remove them from Proxmox storage.
   - Removal itself is out of scope for this skill (proxctl has no kickstart delete); surface the storage paths so the operator can clean up manually.

5. **Summary**
   - Confirm "stack <name> is down" and report any leftover artifacts.

## Failure Modes

| Failure | Response |
|---------|----------|
| User does not type stack name verbatim | Abort; no mutations. |
| `workflow_down` fails | Keep partial state; run `vm_list` and report; do NOT retry automatically. |
| Leftover VMs after `workflow_down` | Report them; require the user to decide whether to `vm_delete` each. |

## Example

```
User: /proxctl-stack-down oracle-rac-uat
Agent: This will DESTROY:
       - rac1 (vmid 101) — running
       - rac2 (vmid 102) — running
       Type the stack name to confirm: oracle-rac-uat
User: oracle-rac-uat
Agent: (workflow down) → (verify empty) → done. Leftover ISO: iso-store:iso/oracle-rac-uat-ks.iso.
```
