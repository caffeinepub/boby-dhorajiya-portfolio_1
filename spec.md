# Specification

## Summary
**Goal:** Restore `backend/main.mo` to its exact Version 12 state by reverting all changes introduced in versions 13–16, and generate a migration file to safely transition existing canister state back to the Version 12 schema.

**Planned changes:**
- Revert `backend/main.mo` to Version 12, removing all schema changes, new endpoints, actor methods, and logic modifications introduced in versions 13–16
- Create a `migration.mo` file that handles stable variable shape differences between version 16 and version 12, gracefully dropping or mapping any fields/entities added in versions 13–16

**User-visible outcome:** The backend canister runs the Version 12 code and can be upgraded with existing persisted data safely migrated back to the Version 12 schema, while the frontend remains completely untouched.
