---
name: proxctl-stack-up
description: Provision every VM in a proxctl stack end-to-end (plan → confirm → up → poll status). Use when user runs /proxctl-stack-up or asks to bring up / provision / deploy an entire proxctl stack.
---

# /proxctl-stack-up

End-to-end provisioning of every VM in a proxctl stack: preflight → plan → user confirm → workflow up → poll status → report.

## Usage

```
/proxctl-stack-up <stack>
```

`<stack>` is either a bookmarked stack name (from `~/.proxctl/stacks.yaml`) or an absolute path to a stack directory containing `env.yaml`.

## Workflow

1. **Preflight**
   - Call `proxctl_config_validate` with `target=<stack>` to parse `env.yaml` and fail fast on schema errors.
   - Confirm Proxmox context is reachable (the Go binary does this as part of validate; abort on error).

2. **Resolve stack path**
   - If `<stack>` is a bookmark: call `proxctl_stack_show` with `name=<stack>` and extract the resolved path + sha.
   - If `<stack>` is a path: skip — pass it directly to downstream tools as `target`.
   - Echo the resolved path + sha to the user so they can confirm the right stack.

3. **Plan**
   - Call `proxctl_workflow_plan` with `target=<resolved-stack>`.
   - Render the change set (nodes to create, ISOs to build, snapshots to take) to the user.
   - **Stop and ask** for explicit confirmation before mutating anything.

4. **Apply**
   - On confirm: call `proxctl_workflow_up` with `target=<resolved-stack>` (the Go binary enforces its own standard+echo confirm).
   - Do NOT parallelise — the workflow owns ordering.

5. **Poll**
   - Call `proxctl_workflow_status` with `target=<resolved-stack>` every ~30 s until every VM reports `running`.
   - Give up after 20 minutes and surface the last status payload.

6. **Summary**
   - Emit a table of `<hostname> | <ip> | <status>` for every node in the stack.
   - Mention next steps (e.g. `linuxctl apply` to configure the hosts).

## Failure Modes

| Failure | Response |
|---------|----------|
| `config_validate` fails | Print the validator error; do NOT proceed to plan. |
| `stack_show` returns no match | Tell the user to `/proxctl-stack-*` add or pass a path. |
| User rejects plan confirmation | Exit cleanly; make no mutations. |
| `workflow_up` fails partway | Keep the partial state; show `workflow_status`; suggest `/proxctl-stack-down` or rerun. |
| Status poll timeout (20 min) | Report last seen statuses and the node(s) still pending. |

## Example

```
User: /proxctl-stack-up oracle-rac-uat
Agent: (validates config) → (resolves bookmark to ~/stacks/oracle-rac-uat, sha abc1234)
       (plan: create rac1 + rac2, build 1 ISO, attach, first-boot, post-install)
       Proceed? [y/N]
User: y
Agent: (workflow up) → (polls status) → done
       | host  | ip            | status  |
       |-------|---------------|---------|
       | rac1  | 10.10.0.101   | running |
       | rac2  | 10.10.0.102   | running |
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
