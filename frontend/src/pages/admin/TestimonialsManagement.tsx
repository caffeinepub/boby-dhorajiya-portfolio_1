import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import { useGetTestimonials, useAddTestimonial, useUpdateTestimonial, useDeleteTestimonial } from '../../hooks/useQueries';
import { type Testimonial } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const TestimonialCard = memo(({ testimonial, onEdit, onDelete, isDeleting }: TestimonialCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between py-3">
      <div>
        <CardTitle className="text-base">{testimonial.author}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {testimonial.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" onClick={() => onEdit(testimonial)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={() => onDelete(testimonial.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
));

function TestimonialsManagementContent() {
  const { data: testimonials = [], isLoading } = useGetTestimonials();
  const addTestimonial = useAddTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ author: '', message: '' });

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = testimonials.filter(
    (t) =>
      t.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.message.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = useCallback(() => {
    setEditingTestimonial(null);
    setForm({ author: '', message: '' });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({ author: testimonial.author, message: testimonial.message });
    setDialogOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!form.author || !form.message) {
      toast.error('Author and message are required.');
      return;
    }
    try {
      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({ id: editingTestimonial.id, ...form });
        toast.success('Testimonial updated.');
      } else {
        await addTestimonial.mutateAsync(form);
        toast.success('Testimonial created.');
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save testimonial.';
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial.mutateAsync(id);
      toast.success('Testimonial deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete testimonial.';
      toast.error(msg);
    }
  }, [deleteTestimonial]);

  const isSaving = addTestimonial.isPending || updateTestimonial.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Testimonial
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search testimonials..."
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
                No testimonials found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((testimonial) => (
                <TestimonialCard
                  key={String(testimonial.id)}
                  testimonial={testimonial}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteTestimonial.isPending}
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
            <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Author *</Label>
              <Input value={form.author} onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                rows={4}
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

export default function TestimonialsManagement() {
  return (
    <AdminGuard>
      <TestimonialsManagementContent />
    </AdminGuard>
  );
}
