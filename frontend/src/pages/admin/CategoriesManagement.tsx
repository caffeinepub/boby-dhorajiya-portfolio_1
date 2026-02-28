import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useQueries';
import { type ProjectCategory } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface CategoryCardProps {
  cat: ProjectCategory;
  onEdit: (cat: ProjectCategory) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const CategoryCard = memo(({ cat, onEdit, onDelete, isDeleting }: CategoryCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between py-3">
      <div>
        <CardTitle className="text-base">{cat.name}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" onClick={() => onEdit(cat)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={() => onDelete(cat.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
));

function CategoriesManagementContent() {
  const { data: categories = [], isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = useCallback(() => {
    setEditingCategory(null);
    setForm({ name: '', slug: '' });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((cat: ProjectCategory) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setDialogOpen(true);
  }, []);

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      // Auto-generate slug only when adding new category
      ...(editingCategory ? {} : {
        slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      }),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast.error('Name and slug are required.');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...form });
        toast.success('Category updated.');
      } else {
        await createCategory.mutateAsync(form);
        toast.success('Category created.');
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category.';
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Category deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category.';
      toast.error(msg);
    }
  }, [deleteCategory]);

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Category
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginated.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No categories found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((cat) => (
                <CategoryCard
                  key={String(cat.id)}
                  cat={cat}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteCategory.isPending}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CategoriesManagement() {
  return (
    <AdminGuard>
      <CategoriesManagementContent />
    </AdminGuard>
  );
}
