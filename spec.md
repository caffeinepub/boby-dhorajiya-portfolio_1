# Specification

## Summary
**Goal:** Fix 401 Unauthorized errors that occur when a logged-in admin attempts to create, update, or delete resources (projects, services, skills, blogs, categories, testimonials, social links, SEO settings) in the admin panel.

**Planned changes:**
- Fix `backend/main.mo` so all mutation functions (`addProject`, `updateProject`, `deleteProject`, `addService`, `updateService`, `deleteService`, `addSkill`, `updateSkill`, `deleteSkill`, and equivalents for blogs, categories, testimonials, social links, SEO settings) correctly compare the transaction `caller` principal against the stored admin principal.
- Ensure `claimAdmin` in `backend/main.mo` stores the caller's principal correctly so subsequent mutation calls from the same identity pass the admin check.
- Fix `frontend/src/hooks/useActorWrapper.ts` to always initialize the actor with the authenticated identity when the user is logged in, rebuild the actor on identity changes (login/logout), and prevent fallback to anonymous identity due to race conditions or stale cache.
- Ensure all mutation hooks in `useQueries.ts` use the authenticated actor from the wrapper.
- Fix `frontend/src/components/AdminGuard.tsx` to reliably confirm admin status on each protected route and persist admin state across navigations without loss.

**User-visible outcome:** A logged-in admin can successfully create, update, and delete skills, projects, services, and other resources without receiving "Unauthorized" errors. Non-admin users still correctly receive unauthorized responses.
