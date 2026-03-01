import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Wrench,
  Users,
  Search,
  HelpCircle,
  Briefcase,
  Star,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { path: '/admin/categories', label: 'Categories', icon: Tags },
  { path: '/admin/experience', label: 'Experience', icon: Briefcase },
  { path: '/admin/services', label: 'Services', icon: Wrench },
  { path: '/admin/skills', label: 'Skills', icon: Star },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
  { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { path: '/admin/leads', label: 'Leads', icon: Users },
  { path: '/admin/seo', label: 'SEO', icon: Search },
  { path: '/admin/help', label: 'Help', icon: HelpCircle },
];

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Portfolio
        </Link>
      </div>
    </aside>
  );
}
