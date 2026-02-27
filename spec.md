# Specification

## Summary
**Goal:** Build a personal portfolio website for Boby Dhorajiya, a freelance Flutter & React Native mobile app developer, with a public-facing site, admin panel, and Internet Computer backend.

**Planned changes:**

### Frontend Pages & Sections
- **Home**: Hero section with headline "Hi, I'm Boby — Mobile App Developer", subheadline about Flutter & React Native, and a "Let's Build Your App" CTA button; hero background image displayed behind the text
- **About**: Page with bio text positioning Boby as a Freelance Mobile App Developer specializing in Flutter, React Native, and mobile security
- **Skills**: Section displaying categorized skills — Primary (Flutter, Dart), Secondary (React Native), Security (Secure API Integration, Authentication Security, Secure Local Storage, Data Encryption), Additional (Firebase, REST APIs, Web Development)
- **Projects**: Page showing project cards with App Name, Platform, Tech Used, Security Implemented, Description, and Role; seeded with placeholder data
- **Services**: Section with cards for Flutter App Development, React Native Development, Secure Mobile App Architecture, API Integration, Firebase Integration, Mobile App Security Consulting, and Web Development Support
- **Experience**: Page presenting Boby as a Freelance Mobile App Developer working on production Flutter and React Native apps
- **Testimonials**: Page fetching and displaying testimonial cards (name + message) from the backend
- **Blog**: Listing page showing post titles; detail page accessible via slug-based routing with full content
- **Contact**: Form with Name, Email, Message fields; on submit, saves lead to backend and shows confirmation
- **Admin Panel** (`/admin`): Internet Identity-authenticated dashboard showing counts for Projects, Leads, and Blog posts; full CRUD management for Projects, Blog Posts, Testimonials, Skills, Services, Leads, and SEO Settings

### Navigation
- Top navigation bar with links to all pages (Home, About, Skills, Projects, Services, Experience, Testimonials, Blog, Contact, Admin)
- Responsive with hamburger menu on mobile; active page highlighted

### Theme & UI
- Dark mode default with light mode toggle
- Electric cyan/green accent color applied consistently to buttons, headings, and highlights
- Mobile-first responsive layout
- Subtle scroll and hover CSS animations on hero and cards
- Security-shield icon displayed where appropriate

### SEO
- Per-page meta title and description; home defaults: "Boby Dhorajiya – Flutter & React Native Developer" / "Mobile app developer specializing in Flutter, React Native & mobile security."
- Admin can edit SEO settings per page

### Backend (Motoko single actor)
- Stable data structures for: `projects`, `skills`, `services`, `testimonials`, `blogs`, `leads`, `seo_settings`
- Full CRUD query/update calls for each entity
- Data persists across canister upgrades via stable variables

**User-visible outcome:** Visitors can browse Boby's portfolio, read his blog, view projects and services, and submit a contact inquiry. An authenticated admin can log in via Internet Identity to manage all content and SEO settings through a dashboard.
