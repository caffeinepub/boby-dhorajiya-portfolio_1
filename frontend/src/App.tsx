import { lazy, Suspense } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Loader2 } from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Public pages - static imports for fast initial load
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Services from './pages/Services';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import ProfileSetup from './components/ProfileSetup';

// Admin pages - lazy loaded for code splitting
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProjectsManagement = lazy(() => import('./pages/admin/ProjectsManagement'));
const CategoriesManagement = lazy(() => import('./pages/admin/CategoriesManagement'));
const SkillsManagement = lazy(() => import('./pages/admin/SkillsManagement'));
const ServicesManagement = lazy(() => import('./pages/admin/ServicesManagement'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const TestimonialsManagement = lazy(() => import('./pages/admin/TestimonialsManagement'));
const LeadsManagement = lazy(() => import('./pages/admin/LeadsManagement'));
const SeoManagement = lazy(() => import('./pages/admin/SeoManagement'));
const SocialLinksManagement = lazy(() => import('./pages/admin/SocialLinksManagement'));
const Help = lazy(() => import('./pages/admin/Help'));

const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ProfileSetup />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Public layout with nav/footer
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

// Admin layout (no public nav/footer)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<AdminLoadingFallback />}>
        <Outlet />
      </Suspense>
    </div>
  ),
});

// Public routes
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

// Admin routes - /admin redirects to /admin/dashboard
const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard' });
  },
});
const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/dashboard',
  component: Dashboard,
});
const adminProjectsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/projects', component: ProjectsManagement });
const adminCategoriesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/categories', component: CategoriesManagement });
const adminSkillsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/skills', component: SkillsManagement });
const adminServicesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/services', component: ServicesManagement });
const adminBlogRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/blog', component: BlogManagement });
const adminTestimonialsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/testimonials', component: TestimonialsManagement });
const adminLeadsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/leads', component: LeadsManagement });
const adminSeoRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/seo', component: SeoManagement });
const adminSocialLinksRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/social-links', component: SocialLinksManagement });
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
    adminSkillsRoute,
    adminServicesRoute,
    adminBlogRoute,
    adminTestimonialsRoute,
    adminLeadsRoute,
    adminSeoRoute,
    adminSocialLinksRoute,
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
