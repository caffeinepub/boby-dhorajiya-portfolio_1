import { useState } from 'react';
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import AdminSidebar from '../../components/AdminSidebar';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectCategory } from '../../backend';

const ITEMS_PER_PAGE = 10;

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

export default function CategoriesManagement() {
  const { data: categories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProjectCategory | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [showForm, setShowForm] = useState(false);

  const filtered = (categories ?? []).filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '' }); setShowForm(true); };
  const openEdit = (cat: ProjectCategory) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug }); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and slug are required.'); return; }
    if (editing) {
      updateMutation.mutate({ id: BigInt(editing.id), name: form.name, slug: form.slug }, {
        onSuccess: () => { toast.success('Category updated!'); setShowForm(false); },
        onError: () => toast.error('Failed to update category.'),
      });
    } else {
      createMutation.mutate({ name: form.name, slug: form.slug }, {
        onSuccess: () => { toast.success('Category created!'); setShowForm(false); },
        onError: () => toast.error('Failed to create category.'),
      });
    }
  };

  const handleDelete = (id: bigint) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Category deleted!'),
      onError: () => toast.error('Failed to delete category.'),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <p className="text-muted-foreground mt-1">Manage project categories</p>
              </div>
              <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Add Category</Button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cat-name">Name</Label>
                    <Input
                      id="cat-name"
                      value={form.name}
                      onChange={(e) => setForm({ name: e.target.value, slug: generateSlug(e.target.value) })}
                      placeholder="Mobile App Development"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-slug">Slug</Label>
                    <Input
                      id="cat-slug"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="mobile-app-dev"
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                      {editing ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
            ) : paginated.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Tag size={40} className="mx-auto mb-3 opacity-30" />
                <p>No categories found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((cat) => (
                  <div key={String(cat.id)} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(cat)} aria-label={`Edit ${cat.name}`}>
                        <Pencil size={15} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${cat.name}`}>
                            <Trash2 size={15} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{cat.name}"? Projects in this category will have their category removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(BigInt(cat.id))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
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
    </AdminGuard>
  );
}
