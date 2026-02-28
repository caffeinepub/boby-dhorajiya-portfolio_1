import React from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useGetDashboardStats } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Users, FileText, Settings, Star, Wrench, Link, BarChart3 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

function DashboardContent() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Projects',
      value: stats ? Number(stats.projectCount) : 0,
      icon: FolderOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Leads',
      value: stats ? Number(stats.leadCount) : 0,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Blog Posts',
      value: stats ? Number(stats.blogCount) : 0,
      icon: FileText,
      color: 'text-purple-500',
    },
  ];

  const navCards = [
    { title: 'Projects', path: '/admin/projects', icon: FolderOpen, desc: 'Manage your portfolio projects' },
    { title: 'Blog', path: '/admin/blog', icon: FileText, desc: 'Write and manage blog posts' },
    { title: 'Services', path: '/admin/services', icon: Wrench, desc: 'Manage offered services' },
    { title: 'Skills', path: '/admin/skills', icon: BarChart3, desc: 'Showcase your skills' },
    { title: 'Testimonials', path: '/admin/testimonials', icon: Star, desc: 'Manage client testimonials' },
    { title: 'Leads', path: '/admin/leads', icon: Users, desc: 'View contact form submissions' },
    { title: 'Categories', path: '/admin/categories', icon: FolderOpen, desc: 'Manage project categories' },
    { title: 'SEO', path: '/admin/seo', icon: Settings, desc: 'Configure SEO settings' },
    { title: 'Social Links', path: '/admin/social-links', icon: Link, desc: 'Manage social media links' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome to your portfolio admin panel.</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Cards */}
          <h2 className="text-xl font-semibold text-foreground mb-4">Manage Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.map((card) => (
              <Card
                key={card.title}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate({ to: card.path })}
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <card.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
