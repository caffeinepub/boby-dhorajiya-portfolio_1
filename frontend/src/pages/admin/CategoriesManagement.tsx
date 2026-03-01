import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import {
  useGetProjectCategories,
  useAddProjectCategory,
  useUpdateProjectCategory,
  useDeleteProjectCategory,
  useUpdateCategoryOrder,
} from '../../hooks/useQueries';
import { type ProjectCategory } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
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
  index: number;
  total: number;
  onEdit: (cat: ProjectCategory) => void;
  onDelete: (id: bigint) => void;
  onMoveUp: (cat: ProjectCategory, index: number) => void;
  onMoveDown: (cat: ProjectCategory, index: number) => void;
  isDeleting: boolean;
  isReordering: boolean;
}

const CategoryCard = memo(({
  cat,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDeleting,
  isReordering,
}: CategoryCardProps) => (
  <Card className="transition-all">
    <CardHeader className="flex flex-row items-center justify-between py-3 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <CardTitle className="text-base truncate">{cat.name}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Reorder controls */}
        <div className="flex flex-col gap-0.5 mr-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onMoveUp(cat, index)}
            disabled={index === 0 || isReordering}
            title="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onMoveDown(cat, index)}
            disabled={index === total - 1 || isReordering}
            title="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
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
  const { data: categories = [], isLoading } = useGetProjectCategories();
  const createCategory = useAddProjectCategory();
  const updateCategory = useUpdateProjectCategory();
  const deleteCategory = useDeleteProjectCategory();
  const updateCategoryOrder = useUpdateCategoryOrder();

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

  // Sort categories by order for display
  const sortedCategories = [...categories].sort((a, b) => Number(a.order) - Number(b.order));

  const filtered = sortedCategories.filter(
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
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: form.name,
          slug: form.slug,
          order: editingCategory.order,
        });
        toast.success('Category updated.');
      } else {
        // Assign next order value
        const maxOrder = sortedCategories.length > 0
          ? Math.max(...sortedCategories.map(c => Number(c.order)))
          : 0;
        await createCategory.mutateAsync({
          name: form.name,
          slug: form.slug,
          order: BigInt(maxOrder + 1),
        });
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

  // Move a category up (swap order with the one above it in the sorted list)
  const handleMoveUp = useCallback(async (cat: ProjectCategory, index: number) => {
    if (index === 0) return;
    const above = filtered[index - 1];
    try {
      // Swap orders
      await Promise.all([
        updateCategoryOrder.mutateAsync({
          category: cat,
          newOrder: above.order,
        }),
        updateCategoryOrder.mutateAsync({
          category: above,
          newOrder: cat.order,
        }),
      ]);
    } catch {
      // Error handled by mutation hook
    }
  }, [filtered, updateCategoryOrder]);

  // Move a category down (swap order with the one below it in the sorted list)
  const handleMoveDown = useCallback(async (cat: ProjectCategory, index: number) => {
    if (index === filtered.length - 1) return;
    const below = filtered[index + 1];
    try {
      await Promise.all([
        updateCategoryOrder.mutateAsync({
          category: cat,
          newOrder: below.order,
        }),
        updateCategoryOrder.mutateAsync({
          category: below,
          newOrder: cat.order,
        }),
      ]);
    } catch {
      // Error handled by mutation hook
    }
  }, [filtered, updateCategoryOrder]);

  const isSaving = createCategory.isPending || updateCategory.isPending;
  const isReordering = updateCategoryOrder.isPending;

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
              {paginated.map((cat, idx) => {
                const actualIndex = (page - 1) * ITEMS_PER_PAGE + idx;
                return (
                  <CategoryCard
                    key={String(cat.id)}
                    cat={cat}
                    index={actualIndex}
                    total={filtered.length}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isDeleting={deleteCategory.isPending}
                    isReordering={isReordering}
                  />
                );
              })}
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
