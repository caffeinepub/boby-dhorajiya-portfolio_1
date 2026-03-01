# Specification

## Summary
**Goal:** Create a `backend/migration.mo` file that safely migrates canister stable state from the Version 16 schema back to the Version 12 schema, preserving all existing data during the upgrade.

**Planned changes:**
- Create `backend/migration.mo` with logic to map all stable variables from the Version 16 schema to the Version 12 schema
- Handle dropped fields (present in V16 but not V12) safely to avoid upgrade panics
- Initialize missing fields (present in V12 but absent in V16) with appropriate default values
- Add explicit type conversion logic for shape differences (e.g., optional vs non-optional fields, restructured records) across BlogPost, Project, Service, Skill, Lead, SeoSetting, SocialLink, Experience, and User types

**User-visible outcome:** The canister can be upgraded from a Version 16 deployment to the Version 12 `main.mo` without data loss, traps, or deserialization errors — all blog posts, projects, services, skills, leads, SEO settings, social links, experiences, and user records are preserved.
