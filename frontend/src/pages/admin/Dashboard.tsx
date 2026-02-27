import React from 'react';
import { Link } from '@tanstack/react-router';
import { FolderOpen, Users, BookOpen, MessageSquare, Wrench, Star, Search, Loader2, LayoutDashboard, TrendingUp } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetDashboardStats } from '../../hooks/useQueries';

const adminSections = [
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen, desc: 'Manage portfolio projects' },
  { href: '/admin/blog', label: 'Blog Posts', icon: BookOpen, desc: 'Create and edit blog content' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star, desc: 'Manage client testimonials' },
  { href: '/admin/skills', label: 'Skills', icon: TrendingUp, desc: 'Update skill listings' },
  { href: '/admin/services', label: 'Services', icon: Wrench, desc: 'Manage service offerings' },
  { href: '/admin/leads', label: 'Leads', icon: Users, desc: 'View contact form submissions' },
  { href: '/admin/seo', label: 'SEO Settings', icon: Search, desc: 'Configure page meta tags' },
];

function DashboardContent() {
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your portfolio content</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="p-6 rounded-2xl border border-border bg-card animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                </div>
                <p className="text-3xl font-display font-bold text-primary">
                  {stats ? Number(stats.projectCount) : 0}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card animate-slide-up stagger-2">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-chart-2" />
                  <span className="text-sm text-muted-foreground">Total Leads</span>
                </div>
                <p className="text-3xl font-display font-bold" style={{ color: 'oklch(0.65 0.22 160)' }}>
                  {stats ? Number(stats.leadCount) : 0}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card animate-slide-up stagger-3">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-chart-3" />
                  <span className="text-sm text-muted-foreground">Blog Posts</span>
                </div>
                <p className="text-3xl font-display font-bold" style={{ color: 'oklch(0.55 0.18 280)' }}>
                  {stats ? Number(stats.blogCount) : 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map((section, idx) => (
            <Link
              key={section.href}
              to={section.href}
              className="p-5 rounded-2xl border border-border bg-card card-hover group animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                  <section.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{section.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{section.desc}</p>
            </Link>
          ))}
        </div>
      </div>
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
