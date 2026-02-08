---
description: Standard workflow for implementing features following the Specification-First process
---

Execute this workflow at the start of any new Specification or Phase.

# 1. Initialization (Run Once per Session)
- [ ] Determine the active specification ID and name (e.g., `017-theme-infrastructure`).
- [ ] Read the core documents:
  - `view_file .specify/specs/[ID]-[NAME]/spec.md`
  - `view_file .specify/specs/[ID]-[NAME]/plan.md`
  - `view_file .specify/specs/[ID]-[NAME]/tasks.md`

# 2. Implementation Loop (Repeat for each Task)
- [ ] Select a task from `.specify/specs/[ID]-[NAME]/tasks.md`.
- [ ] **Implement**: Write tests (TDD) and implementation code.
- [ ] **Verify**: Run `npm test` and `npm run type-check`.
- [ ] **Update Tasks**:
  - Mark the task as `[x]` in `.specify/specs/[ID]-[NAME]/tasks.md`.
  - Update any `task.md` artifacts to match.

# 3. Phase Checkpoint (After Completing a Group/Phase)
- [ ] Confirm all tasks in the current Phase are marked `[x]`.
- [ ] Run `git status` to check changes.
- [ ] Stage changes: `git add .`
- [ ] Commit changes: `git commit -m "feat([SCOPE]): Complete [PHASE NAME]"`
- [ ] Push changes: `git push origin [feature-branch]`
- [ ] Notify user of progress.

# 4. Finalization (End of Spec)
- [ ] Ensure all tasks are complete.
- [ ] Verify `CLAUDE.md` is updated.
- [ ] Verify `walkthrough.md` is updated.
- [ ] Push final changes.
