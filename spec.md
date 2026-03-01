# Specification

## Summary
**Goal:** Restore all frontend source files to their Version 12 state by reverting all changes introduced in versions 13 through 16.

**Planned changes:**
- Revert all frontend pages (Home.tsx, About.tsx, Blog.tsx, BlogPost.tsx, Contact.tsx, Experience.tsx, Projects.tsx, Services.tsx, Skills.tsx, Testimonials.tsx, NotFound.tsx) to Version 12
- Revert all admin pages (Dashboard.tsx, BlogManagement.tsx, CategoriesManagement.tsx, ExperienceManagement.tsx, Help.tsx, LeadsManagement.tsx, ProjectsManagement.tsx, SeoManagement.tsx, ServicesManagement.tsx, SkillsManagement.tsx, SocialLinksManagement.tsx, TestimonialsManagement.tsx) to Version 12
- Revert all non-immutable components (AdminGuard.tsx, AdminSidebar.tsx, Footer.tsx, Layout.tsx, LoginButton.tsx, Navigation.tsx, ProfileSetup.tsx, SEOHead.tsx, ThemeToggle.tsx) to Version 12
- Revert non-immutable hooks (useActorWrapper.ts, useQueries.ts) to Version 12
- Revert global stylesheets (frontend/src/index.css, frontend/index.css) to Version 12
- Revert configuration files (tailwind.config.js, frontend/index.html, frontend/src/App.tsx) to Version 12
- Leave immutable paths unchanged (useInternetIdentity.ts, useActor.ts, main.tsx, components/ui)

**User-visible outcome:** The frontend application reflects its Version 12 state with no remnants of versions 13–16, and builds without errors.
