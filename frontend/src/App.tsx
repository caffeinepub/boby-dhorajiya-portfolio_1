import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Services from './pages/Services';
import Experience from './pages/Experience';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Dashboard from './pages/admin/Dashboard';
import ProjectsManagement from './pages/admin/ProjectsManagement';
import BlogManagement from './pages/admin/BlogManagement';
import TestimonialsManagement from './pages/admin/TestimonialsManagement';
import SkillsManagement from './pages/admin/SkillsManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import LeadsManagement from './pages/admin/LeadsManagement';
import SeoManagement from './pages/admin/SeoManagement';
import NotFound from './pages/NotFound';
import ProfileSetup from './components/ProfileSetup';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <ProfileSetup />
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About });
const skillsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/skills', component: Skills });
const projectsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projects', component: Projects });
const servicesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/services', component: Services });
const experienceRoute = createRoute({ getParentRoute: () => rootRoute, path: '/experience', component: Experience });
const testimonialsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/testimonials', component: Testimonials });
const blogRoute = createRoute({ getParentRoute: () => rootRoute, path: '/blog', component: Blog });
const blogPostRoute = createRoute({ getParentRoute: () => rootRoute, path: '/blog/$slug', component: BlogPost });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contact', component: Contact });

// Admin routes
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: Dashboard });
const adminProjectsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/projects', component: ProjectsManagement });
const adminBlogRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/blog', component: BlogManagement });
const adminTestimonialsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/testimonials', component: TestimonialsManagement });
const adminSkillsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/skills', component: SkillsManagement });
const adminServicesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/services', component: ServicesManagement });
const adminLeadsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/leads', component: LeadsManagement });
const adminSeoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/seo', component: SeoManagement });

const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '*', component: NotFound });

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  skillsRoute,
  projectsRoute,
  servicesRoute,
  experienceRoute,
  testimonialsRoute,
  blogRoute,
  blogPostRoute,
  contactRoute,
  adminRoute,
  adminProjectsRoute,
  adminBlogRoute,
  adminTestimonialsRoute,
  adminSkillsRoute,
  adminServicesRoute,
  adminLeadsRoute,
  adminSeoRoute,
  notFoundRoute,
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
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
