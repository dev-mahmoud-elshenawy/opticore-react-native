---
description: Workflow for aligning git flow with spec phases
---

# 1. Branch Setup

- [ ] Open the relevant `tasks.md` file (e.g., `.specify/specs/[ID]/tasks.md`) to identify the branch name.
- [ ] Checkout the branch:
      // turbo
      git checkout [BRANCH_NAME] 2>/dev/null || git checkout -b [BRANCH_NAME]

# 2. Implementation Loop (Per Phase)

- [ ] Complete all tasks in the current phase.
- [ ] Verify changes with `npm test`.

# 3. Phase Completion Sync

- [ ] **Mark Tasks Complete**:
      Update the spec's `tasks.md` file, changing `[ ]` to `[x]` for all completed items in this phase.
- [ ] **Commit & Push**:
      // turbo
      git add .
      // turbo
      git commit -m "feat: complete Phase [X]"
      // turbo
      git push origin [BRANCH_NAME]
