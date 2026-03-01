import React, { lazy, Suspense } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const Services = lazy(() => import('./pages/Services'));
const Skills = lazy(() => import('./pages/Skills'));
const Experience = lazy(() => import('./pages/Experience'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const Testimonials = lazy(() => import('./pages/Testimonials'));

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProjectsManagement = lazy(() => import('./pages/admin/ProjectsManagement'));
const CategoriesManagement = lazy(() => import('./pages/admin/CategoriesManagement'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const TestimonialsManagement = lazy(() => import('./pages/admin/TestimonialsManagement'));
const SkillsManagement = lazy(() => import('./pages/admin/SkillsManagement'));
const ServicesManagement = lazy(() => import('./pages/admin/ServicesManagement'));
const LeadsManagement = lazy(() => import('./pages/admin/LeadsManagement'));
const SeoManagement = lazy(() => import('./pages/admin/SeoManagement'));
const SocialLinksManagement = lazy(() => import('./pages/admin/SocialLinksManagement'));
const ExperienceManagement = lazy(() => import('./pages/admin/ExperienceManagement'));
const Help = lazy(() => import('./pages/admin/Help'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// ─── Root route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ProfileSetup />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// ─── Public layout ────────────────────────────────────────────────────────────
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  ),
});

// ─── Admin layout ─────────────────────────────────────────────────────────────
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  ),
});

// ─── Public routes ────────────────────────────────────────────────────────────
const homeRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/', component: Home });
const aboutRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/about', component: About });
const projectsRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/projects', component: Projects });
const servicesRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/services', component: Services });
const skillsRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/skills', component: Skills });
const experienceRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/experience', component: Experience });
const blogRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/blog', component: Blog });
const blogPostRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/blog/$slug', component: BlogPost });
const contactRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/contact', component: Contact });
const testimonialsRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/testimonials', component: Testimonials });

// ─── Admin routes ─────────────────────────────────────────────────────────────
const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard' });
  },
});
const adminDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/dashboard', component: Dashboard });
const adminProjectsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/projects', component: ProjectsManagement });
const adminCategoriesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/categories', component: CategoriesManagement });
const adminBlogRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/blog', component: BlogManagement });
const adminTestimonialsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/testimonials', component: TestimonialsManagement });
const adminSkillsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/skills', component: SkillsManagement });
const adminServicesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/services', component: ServicesManagement });
const adminLeadsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/leads', component: LeadsManagement });
const adminSeoRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/seo', component: SeoManagement });
const adminSocialLinksRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/social-links', component: SocialLinksManagement });
const adminExperienceRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/experience', component: ExperienceManagement });
const adminHelpRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/help', component: Help });

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    aboutRoute,
    projectsRoute,
    servicesRoute,
    skillsRoute,
    experienceRoute,
    blogRoute,
    blogPostRoute,
    contactRoute,
    testimonialsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminProjectsRoute,
    adminCategoriesRoute,
    adminBlogRoute,
    adminTestimonialsRoute,
    adminSkillsRoute,
    adminServicesRoute,
    adminLeadsRoute,
    adminSeoRoute,
    adminSocialLinksRoute,
    adminExperienceRoute,
    adminHelpRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
