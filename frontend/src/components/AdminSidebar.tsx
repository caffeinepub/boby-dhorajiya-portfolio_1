import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  Wrench,
  Star,
  BookOpen,
  Users,
  Search,
  Share2,
  HelpCircle,
  Tags,
  Clock,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/experience', label: 'Experience', icon: Clock },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/skills', label: 'Skills', icon: Briefcase },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { to: '/admin/help', label: 'Help', icon: HelpCircle },
];

export default function AdminSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/" className="text-lg font-bold text-primary hover:opacity-80 transition-opacity">
          ← Portfolio
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map(link => {
          const Icon = link.icon;
          const isActive = currentPath === link.to || currentPath.startsWith(link.to + '/');
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
