# Specification

## Summary
**Goal:** Fix the broken admin login flow so that the "Go to Login" button correctly triggers the Internet Identity popup inline, and the full authentication + admin claim flow works end-to-end.

**Planned changes:**
- Rewrite the `AdminGuard` component from scratch with a minimal implementation that:
  - Shows "Authentication Required" and a "Go to Login" button when unauthenticated; clicking it calls `login()` directly to open the Internet Identity popup without navigating away
  - After successful login, immediately invalidates and refetches the admin-status query
  - Shows "Claim Admin Access" button if authenticated and no admin is registered yet; calls backend `claimAdmin` and redirects to `/admin` on success
  - Shows "Access Denied" if another admin is already registered and the current user is not that admin
  - Renders children if the current user is the admin
- Fix backend `claimAdmin` and `checkAdminStatus` functions in `backend/main.mo`:
  - `claimAdmin` stores caller's principal when `adminPrincipal` is `null`/`None` and returns `#success`
  - `checkAdminStatus` returns `true` for the stored admin principal
  - `claimAdmin` returns `#alreadyClaimed` if admin is already set and caller is not that admin
  - `claimAdmin` returns `#notAuthenticated` for anonymous callers
  - All variant tags are consistent (no mixed `__kind__` tags)
  - Add a `resetAdmin` function callable only by the current admin to reset `adminPrincipal` to `null`
- Fix the actor initialization so it is re-created with the fresh authenticated identity immediately after Internet Identity login, before any admin-status queries are executed, eliminating race conditions

**User-visible outcome:** Visiting `/admin` while unauthenticated shows an "Authentication Required" screen with a working "Go to Login" button that opens the Internet Identity popup. After logging in, the user can claim admin access or access the admin panel if already registered as admin.
