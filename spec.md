# Specification

## Summary
**Goal:** Fix the AdminGuard component and backend claimAdmin / checkAdminStatus flow so that the "Claim Admin Access" button appears and works correctly after Internet Identity login in both Chrome and Safari.

**Planned changes:**
- Rewrite the AdminGuard component to correctly distinguish between three states: no admin registered yet (show "Claim Admin Access" button), current user is the admin (allow access), and a different admin is registered (show "Access Denied")
- Fix actor caching and race conditions so that admin status queries are invalidated and re-fetched immediately after Internet Identity login completes
- Fix the claimAdmin call to handle all return variants including `__kind__`-tagged variants, and on success re-fetch admin status and redirect to /admin dashboard
- Ensure the backend `claimAdmin` in `main.mo` stores the caller's principal when no admin is registered yet, and that `checkAdminStatus` returns true for that principal on subsequent calls
- Invalidate and refetch admin-status queries after a successful claimAdmin call
- Ensure the fix works in both Chrome and Safari

**User-visible outcome:** After logging in via Internet Identity on a fresh deployment, the user sees a "Claim Admin Access" button and can successfully claim admin access, which redirects them to the /admin dashboard. If another admin is already registered, the user sees "Access Denied" with no claim button.
