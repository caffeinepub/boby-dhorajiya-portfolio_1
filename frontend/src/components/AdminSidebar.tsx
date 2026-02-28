import { Link, useRouter } from '@tanstack/react-router';
import {
  LayoutDashboard, FolderOpen, Tag, Zap, Briefcase, BookOpen,
  MessageSquare, Users, Share2, Search, HelpCircle, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/admin/projects', icon: FolderOpen },
  { label: 'Categories', path: '/admin/categories', icon: Tag },
  { label: 'Skills', path: '/admin/skills', icon: Zap },
  { label: 'Services', path: '/admin/services', icon: Briefcase },
  { label: 'Blogs', path: '/admin/blog', icon: BookOpen },
  { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
  { label: 'Leads', path: '/admin/leads', icon: Users },
  { label: 'Social Links', path: '/admin/social-links', icon: Share2 },
  { label: 'SEO Settings', path: '/admin/seo', icon: Search },
  { label: 'Help', path: '/admin/help', icon: HelpCircle },
];

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: '/admin/dashboard' });
  };

  const isActive = (path: string) => {
    // Match /admin/dashboard also when on /admin
    if (path === '/admin/dashboard') {
      return currentPath === '/admin/dashboard' || currentPath === '/admin';
    }
    return currentPath === path;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Portfolio Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-card border border-border text-foreground shadow-lg"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 w-64 h-full bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
