import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  Clock,
  FolderOpen,
  Search,
  Share2,
  Star,
  Tags,
  Users,
  Wrench,
} from "lucide-react";
import { useGetDashboardStats } from "../../hooks/useQueries";

const navCards = [
  {
    to: "/admin/projects",
    label: "Projects",
    icon: FolderOpen,
    description: "Manage your portfolio projects",
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: Tags,
    description: "Manage project categories",
  },
  {
    to: "/admin/experience",
    label: "Experience",
    icon: Clock,
    description: "Manage work experience",
  },
  {
    to: "/admin/services",
    label: "Services",
    icon: Wrench,
    description: "Manage offered services",
  },
  {
    to: "/admin/skills",
    label: "Skills",
    icon: Briefcase,
    description: "Manage technical skills",
  },
  {
    to: "/admin/testimonials",
    label: "Testimonials",
    icon: Star,
    description: "Manage client testimonials",
  },
  {
    to: "/admin/blog",
    label: "Blog",
    icon: BookOpen,
    description: "Manage blog posts",
  },
  {
    to: "/admin/leads",
    label: "Leads",
    icon: Users,
    description: "View contact form submissions",
  },
  {
    to: "/admin/seo",
    label: "SEO",
    icon: Search,
    description: "Manage SEO settings",
  },
  {
    to: "/admin/social-links",
    label: "Social Links",
    icon: Share2,
    description: "Manage social media links",
  },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = [
    { label: "Projects", value: stats?.projects ?? 0, icon: FolderOpen },
    { label: "Blog Posts", value: stats?.blogs ?? 0, icon: BookOpen },
    { label: "Leads", value: stats?.leads ?? 0, icon: Users },
    { label: "Services", value: stats?.services ?? 0, icon: Wrench },
    { label: "Skills", value: stats?.skills ?? 0, icon: Briefcase },
    { label: "Testimonials", value: stats?.testimonials ?? 0, icon: Star },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your portfolio admin panel.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Manage Content
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.to} to={card.to}>
                <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
                  <CardHeader>
                    <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{card.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
