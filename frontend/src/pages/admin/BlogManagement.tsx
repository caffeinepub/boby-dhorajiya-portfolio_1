import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, BookOpen, Calendar, Search } from 'lucide-react';
import { useGetBlogs, useAddBlog, useUpdateBlog, useDeleteBlog, useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AdminSidebar from '../../components/AdminSidebar';
import type { BlogPost } from '../../backend';
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

interface BlogFormData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

const emptyForm: BlogFormData = { title: '', slug: '', metaTitle: '', metaDescription: '', content: '' };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function BlogForm({
  initial, onSubmit, onCancel, isPending,
}: {
  initial?: BlogFormData;
  onSubmit: (data: BlogFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<BlogFormData>(initial || emptyForm);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: initial ? prev.slug : slugify(title) }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title *</Label>
          <Input id="blog-title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-slug">Slug *</Label>
          <Input id="blog-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="post-slug" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-meta-title">Meta Title</Label>
        <Input id="blog-meta-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-meta-desc">Meta Description</Label>
        <Input id="blog-meta-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO description" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-content">Content *</Label>
        <Textarea id="blog-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your blog post content..." rows={8} required />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Post'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

function BlogContent() {
  const { data: blogs, isLoading } = useGetBlogs();
  const addBlogMutation = useAddBlog();
  const updateBlogMutation = useUpdateBlog();
  const deleteBlogMutation = useDeleteBlog();

  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = (blogs ?? []).filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleAdd = async (data: BlogFormData) => {
    try {
      await addBlogMutation.mutateAsync(data);
      setShowForm(false);
      toast.success('Blog post added!');
    } catch {
      toast.error('Failed to add blog post.');
    }
  };

  const handleUpdate = async (data: BlogFormData) => {
    if (!editingBlog) return;
    try {
      await updateBlogMutation.mutateAsync({ id: editingBlog.id, ...data });
      setEditingBlog(null);
      toast.success('Blog post updated!');
    } catch {
      toast.error('Failed to update blog post.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteBlogMutation.mutateAsync(id);
      toast.success('Blog post deleted.');
    } catch {
      toast.error('Failed to delete blog post.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
              <p className="text-muted-foreground mt-1">Create and manage blog posts</p>
            </div>
            {!showForm && !editingBlog && (
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> New Post</Button>
            )}
          </div>

          {showForm && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">New Blog Post</h2>
              <BlogForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} isPending={addBlogMutation.isPending} />
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No blog posts yet. Write your first post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginated.map((blog) => (
                <div key={blog.id.toString()}>
                  {editingBlog?.id === blog.id ? (
                    <div>
                      <h2 className="font-semibold mb-3">Edit Post</h2>
                      <BlogForm
                        initial={{ title: blog.title, slug: blog.slug, metaTitle: blog.metaTitle, metaDescription: blog.metaDescription, content: blog.content }}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingBlog(null)}
                        isPending={updateBlogMutation.isPending}
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{blog.title}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">/{blog.slug}</p>
                        {blog.metaDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{blog.metaDescription}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(Number(blog.timestamp) / 1_000_000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => setEditingBlog(blog)} aria-label="Edit post">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete post">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{blog.title}"? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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

export default function BlogManagement() {
  return <AdminGuard><BlogContent /></AdminGuard>;
}
