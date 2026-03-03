import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import AdminGuard from "./components/AdminGuard";
import AdminSidebar from "./components/AdminSidebar";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Experience = lazy(() => import("./pages/Experience"));
const Projects = lazy(() => import("./pages/Projects"));
const Services = lazy(() => import("./pages/Services"));
const Skills = lazy(() => import("./pages/Skills"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement"));
const CategoriesManagement = lazy(
  () => import("./pages/admin/CategoriesManagement"),
);
const ExperienceManagement = lazy(
  () => import("./pages/admin/ExperienceManagement"),
);
const Help = lazy(() => import("./pages/admin/Help"));
const LeadsManagement = lazy(() => import("./pages/admin/LeadsManagement"));
const ProjectsManagement = lazy(
  () => import("./pages/admin/ProjectsManagement"),
);
const SeoManagement = lazy(() => import("./pages/admin/SeoManagement"));
const ServicesManagement = lazy(
  () => import("./pages/admin/ServicesManagement"),
);
const SkillsManagement = lazy(() => import("./pages/admin/SkillsManagement"));
const SocialLinksManagement = lazy(
  () => import("./pages/admin/SocialLinksManagement"),
);
const TestimonialsManagement = lazy(
  () => import("./pages/admin/TestimonialsManagement"),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PublicLayout() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function AdminLayout() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </AdminGuard>
  );
}

const rootRoute = createRootRoute();

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/about",
  component: About,
});

const blogRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/blog",
  component: Blog,
});

const blogPostRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/blog/$slug",
  component: BlogPost,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: Contact,
});

const experienceRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/experience",
  component: Experience,
});

const projectsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/projects",
  component: Projects,
});

const servicesRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/services",
  component: Services,
});

const skillsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/skills",
  component: Skills,
});

const testimonialsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/testimonials",
  component: Testimonials,
});

const notFoundRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "*",
  component: NotFound,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/dashboard",
  component: Dashboard,
});

const adminBlogRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/blog",
  component: BlogManagement,
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/categories",
  component: CategoriesManagement,
});

const adminExperienceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/experience",
  component: ExperienceManagement,
});

const adminHelpRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/help",
  component: Help,
});

const adminLeadsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/leads",
  component: LeadsManagement,
});

const adminProjectsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/projects",
  component: ProjectsManagement,
});

const adminSeoRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/seo",
  component: SeoManagement,
});

const adminServicesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/services",
  component: ServicesManagement,
});

const adminSkillsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/skills",
  component: SkillsManagement,
});

const adminSocialLinksRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/social-links",
  component: SocialLinksManagement,
});

const adminTestimonialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/testimonials",
  component: TestimonialsManagement,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    aboutRoute,
    blogRoute,
    blogPostRoute,
    contactRoute,
    experienceRoute,
    projectsRoute,
    servicesRoute,
    skillsRoute,
    testimonialsRoute,
    notFoundRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminBlogRoute,
    adminCategoriesRoute,
    adminExperienceRoute,
    adminHelpRoute,
    adminLeadsRoute,
    adminProjectsRoute,
    adminSeoRoute,
    adminServicesRoute,
    adminSkillsRoute,
    adminSocialLinksRoute,
    adminTestimonialsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
