import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star, Quote, Search } from 'lucide-react';
import { useGetTestimonials, useAddTestimonial, useUpdateTestimonial, useDeleteTestimonial, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import type { Testimonial } from '../../backend';
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

interface TestimonialFormData {
  author: string;
  message: string;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function TestimonialForm({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: TestimonialFormData;
  onSubmit: (data: TestimonialFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<TestimonialFormData>(initial || { author: '', message: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="space-y-2">
        <Label htmlFor="test-author">Author Name *</Label>
        <Input id="test-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Client name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="test-message">Testimonial *</Label>
        <Textarea id="test-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What did the client say?" rows={4} required />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Testimonial'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function TestimonialsContent() {
  const { data: testimonials, isLoading } = useGetTestimonials();
  const addMutation = useAddTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (testimonials ?? []).filter((t) =>
    t.author.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleAdd = async (data: TestimonialFormData) => {
    try {
      await addMutation.mutateAsync(data);
      setShowForm(false);
      toast.success('Testimonial added!');
    } catch {
      toast.error('Failed to add testimonial.');
    }
  };

  const handleUpdate = async (data: TestimonialFormData) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, ...data });
      setEditingItem(null);
      toast.success('Testimonial updated!');
    } catch {
      toast.error('Failed to update testimonial.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Testimonial deleted.');
    } catch {
      toast.error('Failed to delete testimonial.');
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
              <p className="text-muted-foreground mt-1">Manage client testimonials</p>
            </div>
            {!showForm && !editingItem && (
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">New Testimonial</h2>
              <TestimonialForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={isPending} />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by author..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No testimonials yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((item) => (
                <div key={item.id.toString()}>
                  {editingItem?.id === item.id ? (
                    <div>
                      <h2 className="font-semibold mb-3">Edit Testimonial</h2>
                      <TestimonialForm
                        initial={{ author: item.author, message: item.message }}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingItem(null)}
                        isPending={isPending}
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Quote className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{item.author}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.message}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditingItem(item)} aria-label="Edit testimonial">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete testimonial">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                              <AlertDialogDescription>Delete testimonial from "{item.author}"? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

export default function TestimonialsManagement() {
  return <AdminGuard><TestimonialsContent /></AdminGuard>;
}
