import { useIsCallerAdmin, useGetDashboardStats, useGetSkills, useGetCategories } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import { Link } from '@tanstack/react-router';
import { FolderOpen, Users, BookOpen, Zap, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the admin panel.</p>
          <Link to="/admin" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: skills } = useGetSkills();
  const { data: categories } = useGetCategories();

  const statCards = [
    { label: 'Total Projects', value: stats ? Number(stats.projectCount) : null, icon: FolderOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', path: '/admin/projects' },
    { label: 'Total Leads', value: stats ? Number(stats.leadCount) : null, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', path: '/admin/leads' },
    { label: 'Total Blog Posts', value: stats ? Number(stats.blogCount) : null, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', path: '/admin/blog' },
    { label: 'Total Skills', value: skills ? skills.length : null, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', path: '/admin/skills' },
    { label: 'Total Categories', value: categories ? categories.length : null, icon: Tag, color: 'text-cyan-400', bg: 'bg-cyan-500/10', path: '/admin/categories' },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 lg:ml-0">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your portfolio.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {statCards.map((card) => (
                <Link
                  key={card.label}
                  to={card.path}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  {statsLoading || card.value === null ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{card.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                  <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Add New Project', path: '/admin/projects', desc: 'Upload and publish a new portfolio project' },
                  { label: 'Write Blog Post', path: '/admin/blog', desc: 'Create and publish a new blog article' },
                  { label: 'Manage Skills', path: '/admin/skills', desc: 'Add or update your technical skills' },
                  { label: 'View Leads', path: '/admin/leads', desc: 'Check new contact form submissions' },
                  { label: 'Manage Social Links', path: '/admin/social-links', desc: 'Update your social media profiles' },
                  { label: 'SEO Settings', path: '/admin/seo', desc: 'Optimize meta titles and descriptions' },
                ].map((action) => (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{action.label}</h3>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
