import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  FolderOpen,
  FileText,
  MessageSquare,
  Wrench,
  Users,
  Search,
  HelpCircle,
  Briefcase,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useGetDashboardStats } from '../../hooks/useQueries';

const managementCards = [
  {
    title: 'Projects',
    description: 'Manage your portfolio projects',
    icon: FolderOpen,
    path: '/admin/projects',
    color: 'text-blue-500',
  },
  {
    title: 'Experience',
    description: 'Manage work experience entries',
    icon: Briefcase,
    path: '/admin/experience',
    color: 'text-amber-500',
  },
  {
    title: 'Services',
    description: 'Manage services you offer',
    icon: Wrench,
    path: '/admin/services',
    color: 'text-green-500',
  },
  {
    title: 'Skills',
    description: 'Manage your technical skills',
    icon: Star,
    path: '/admin/skills',
    color: 'text-yellow-500',
  },
  {
    title: 'Blog',
    description: 'Write and manage blog posts',
    icon: FileText,
    path: '/admin/blog',
    color: 'text-purple-500',
  },
  {
    title: 'Testimonials',
    description: 'Manage client testimonials',
    icon: MessageSquare,
    path: '/admin/testimonials',
    color: 'text-pink-500',
  },
  {
    title: 'Leads',
    description: 'View contact form submissions',
    icon: Users,
    path: '/admin/leads',
    color: 'text-orange-500',
  },
  {
    title: 'SEO Settings',
    description: 'Manage meta tags and SEO',
    icon: Search,
    path: '/admin/seo',
    color: 'text-cyan-500',
  },
  {
    title: 'Help',
    description: 'View admin documentation',
    icon: HelpCircle,
    path: '/admin/help',
    color: 'text-gray-500',
  },
];

export default function Dashboard() {
  const { projectCount, leadCount, blogCount, isLoading: statsLoading } = useGetDashboardStats();

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome to your portfolio admin panel</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {statsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {Number(projectCount)}
                          </p>
                          <p className="text-sm text-muted-foreground">Projects</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {Number(leadCount)}
                          </p>
                          <p className="text-sm text-muted-foreground">Leads</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {Number(blogCount)}
                          </p>
                          <p className="text-sm text-muted-foreground">Blog Posts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Management Cards */}
            <h2 className="text-xl font-semibold text-foreground mb-4">Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {managementCards.map((card) => (
                <Link key={card.path} to={card.path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center`}>
                          <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{card.title}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{card.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
