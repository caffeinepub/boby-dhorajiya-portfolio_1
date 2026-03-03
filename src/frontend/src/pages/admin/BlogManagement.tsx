import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../../backend";
import {
  useAddBlog,
  useDeleteBlog,
  useGetBlogs,
  useUpdateBlog,
} from "../../hooks/useQueries";

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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface BlogCardProps {
  blog: BlogPost;
  onEdit: (blog: BlogPost) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

const BlogCard = memo(
  ({ blog, onEdit, onDelete, isDeleting }: BlogCardProps) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div>
          <CardTitle className="text-base">{blog.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">/{blog.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(blog)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => onDelete(blog.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  ),
);

export default function BlogManagement() {
  const { data: blogs = [], isLoading } = useGetBlogs();
  const addBlog = useAddBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
  });

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      b.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const openAdd = useCallback(() => {
    setEditingBlog(null);
    setForm({
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      content: "",
    });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((blog: BlogPost) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      content: blog.content,
    });
    setDialogOpen(true);
  }, []);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      // Auto-generate slug only when adding new post
      ...(editingBlog ? {} : { slug: generateSlug(title) }),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required.");
      return;
    }
    // Validate slug uniqueness for new posts
    if (!editingBlog) {
      const slugExists = blogs.some((b) => b.slug === form.slug);
      if (slugExists) {
        toast.error(
          "A blog post with this slug already exists. Please use a unique slug.",
        );
        return;
      }
    }
    try {
      if (editingBlog) {
        await updateBlog.mutateAsync({
          id: editingBlog.id,
          ...form,
        });
        toast.success("Blog post updated.");
      } else {
        await addBlog.mutateAsync(form);
        toast.success("Blog post created.");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save blog post.";
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!confirm("Delete this blog post?")) return;
      try {
        await deleteBlog.mutateAsync(id);
        toast.success("Blog post deleted.");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete blog post.";
        toast.error(msg);
      }
    },
    [deleteBlog],
  );

  const isSaving = addBlog.isPending || updateBlog.isPending;

  return (
    <>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Blog Management
            </h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
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
                No blog posts found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((blog) => (
                <BlogCard
                  key={String(blog.id)}
                  blog={blog}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteBlog.isPending}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? "Edit Blog Post" : "New Blog Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Meta Title</Label>
              <Input
                value={form.metaTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaTitle: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Meta Description</Label>
              <Input
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaDescription: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
