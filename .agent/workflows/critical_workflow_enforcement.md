---
description: Critical workflow enforcement and validation steps
---

# Critical Workflow Enforcement

This workflow MUST be followed before requesting user feedback. It ensures that all artifacts, documentation, and code states are synchronized and valid.

## 1. Documentation Synchronization

- [ ] **Task Status Check**: Verify `task.md` accurately reflects the current state of implementation.
  - No tasks should be marked completed `[x]` if code is missing or failing verification.
  - If a task is blocked, mark it `[-]` with a clear reason.
- [ ] **Artifact Update**: Ensure `CLAUDE.md`, `checkpoints.md`, and any spec docs match the code.
  - Do NOT mark a spec "COMPLETED" in docs unless ALL items in `task.md` are `[x]` or `[-]`.

## 2. Quality Gate Verification

- [ ] **Type Safety**: Run `npm run type-check`.
  - Must pass with 0 errors before considering a phase complete.
- [ ] **Linting**: Run `npm run lint`.
  - Must pass with 0 errors.
- [ ] **Testing**: Run relevant tests.
  - If integration tests are blocked by environment, ensure unit tests pass.

## 3. Workflow Adherence Check

- [ ] **Spec Flow**: Confirm adherence to `.agent/workflows/spec_implementation_flow.md`.
  - Were tasks created?
  - Was TDD followed (red-green-refactor)?
  - Was verification done before completion?
- [ ] **Git Alignment**: Confirm adherence to `.agent/workflows/spec_git_alignment.md`.
  - Is the correct branch active?
  - Are commits scoped to the phase?

## 4. Final Sanity Check

- [ ] **Export Verification**: Check `index.ts` files to ensure new modules are exported.
- [ ] **Cleanliness**: Remove temporary debug files (e.g., `trivial.test.ts`).

EXECUTE THIS WORKFLOW MANUALLY OR MENTALLY BEFORE EVERY `notify_user` CALL.
