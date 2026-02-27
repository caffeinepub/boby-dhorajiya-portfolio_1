import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { useGetSeoSettings, useSetSeoSetting, useDeleteSeoSetting, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import type { SeoSetting } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const ITEMS_PER_PAGE = 10;
const PAGE_OPTIONS = ['home', 'about', 'skills', 'projects', 'services', 'experience', 'testimonials', 'blog', 'contact'];

interface SeoFormData {
  page: string;
  metaTitle: string;
  metaDescription: string;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function SeoForm({
  initial, onSubmit, onCancel, isPending, isEdit,
}: {
  initial?: SeoFormData;
  onSubmit: (data: SeoFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<SeoFormData>(initial || { page: '', metaTitle: '', metaDescription: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="seo-page">Page *</Label>
        {isEdit ? (
          <Input id="seo-page" value={form.page} disabled className="opacity-60" />
        ) : (
          <select
            id="seo-page"
            value={form.page}
            onChange={(e) => setForm({ ...form, page: e.target.value })}
            required
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a page...</option>
            {PAGE_OPTIONS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-title">Meta Title *</Label>
        <Input id="seo-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Page title for SEO" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-desc">Meta Description *</Label>
        <Textarea id="seo-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Page description for SEO (150-160 chars)" rows={3} required />
        <p className="text-xs text-muted-foreground">{form.metaDescription.length} / 160 characters</p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save SEO Setting'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function SeoContent() {
  const { data: seoSettings, isLoading } = useGetSeoSettings();
  const setSeoSettingMutation = useSetSeoSetting();
  const deleteSeoSettingMutation = useDeleteSeoSetting();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SeoSetting | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (seoSettings ?? []).filter((s) =>
    s.page.toLowerCase().includes(search.toLowerCase()) ||
    s.metaTitle.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleAdd = async (data: SeoFormData) => {
    try {
      await setSeoSettingMutation.mutateAsync(data);
      setShowForm(false);
      toast.success('SEO setting saved!');
    } catch {
      toast.error('Failed to save SEO setting.');
    }
  };

  const handleUpdate = async (data: SeoFormData) => {
    try {
      await setSeoSettingMutation.mutateAsync(data);
      setEditingItem(null);
      toast.success('SEO setting updated!');
    } catch {
      toast.error('Failed to update SEO setting.');
    }
  };

  const handleDelete = async (pg: string) => {
    try {
      await deleteSeoSettingMutation.mutateAsync(pg);
      toast.success('SEO setting deleted.');
    } catch {
      toast.error('Failed to delete SEO setting.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">SEO Settings</h1>
              <p className="text-muted-foreground mt-1">Configure meta titles and descriptions per page.</p>
            </div>
            {!showForm && !editingItem && (
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add SEO Setting</Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">New SEO Setting</h2>
              <SeoForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={setSeoSettingMutation.isPending} />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by page name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No SEO settings configured yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((item) => (
                <div key={item.page}>
                  {editingItem?.page === item.page ? (
                    <div>
                      <h2 className="font-semibold mb-3">Edit SEO Setting</h2>
                      <SeoForm
                        initial={{ page: item.page, metaTitle: item.metaTitle, metaDescription: item.metaDescription }}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingItem(null)}
                        isPending={setSeoSettingMutation.isPending}
                        isEdit
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground border border-border">
                            /{item.page}
                          </span>
                          <p className="font-semibold text-sm mt-1 truncate">{item.metaTitle}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.metaDescription}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditingItem(item)} aria-label="Edit SEO setting">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete SEO setting">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete SEO Setting</AlertDialogTitle>
                              <AlertDialogDescription>Delete SEO setting for "/{item.page}"? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.page)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SeoManagement() {
  return <AdminGuard><SeoContent /></AdminGuard>;
}
