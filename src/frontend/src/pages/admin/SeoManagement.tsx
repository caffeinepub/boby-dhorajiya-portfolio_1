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
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { toast } from "sonner";
import type { SeoSetting } from "../../backend";
import {
  useDeleteSeoSetting,
  useGetSeoSettings,
  useSetSeoSetting,
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

interface SeoCardProps {
  setting: SeoSetting;
  onEdit: (s: SeoSetting) => void;
  onDelete: (page: string) => void;
  isDeleting: boolean;
}

const SeoCard = memo(
  ({ setting, onEdit, onDelete, isDeleting }: SeoCardProps) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div>
          <CardTitle className="text-base">{setting.page}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {setting.metaTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(setting)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => onDelete(setting.page)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  ),
);

export default function SeoManagement() {
  const { data: seoSettings = [], isLoading } = useGetSeoSettings();
  const setSeoSetting = useSetSeoSetting();
  const deleteSeoSetting = useDeleteSeoSetting();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SeoSetting | null>(null);
  const [form, setForm] = useState({
    page: "",
    metaTitle: "",
    metaDescription: "",
  });

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = seoSettings.filter(
    (s) =>
      s.page.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.metaTitle.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const openAdd = useCallback(() => {
    setEditingSetting(null);
    setForm({ page: "", metaTitle: "", metaDescription: "" });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((setting: SeoSetting) => {
    setEditingSetting(setting);
    setForm({
      page: setting.page,
      metaTitle: setting.metaTitle,
      metaDescription: setting.metaDescription,
    });
    setDialogOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!form.page || !form.metaTitle) {
      toast.error("Page and meta title are required.");
      return;
    }
    try {
      await setSeoSetting.mutateAsync(form);
      toast.success(
        editingSetting ? "SEO setting updated." : "SEO setting created.",
      );
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save SEO setting.";
      toast.error(msg);
    }
  };

  const handleDelete = useCallback(
    async (pageName: string) => {
      if (!confirm("Delete this SEO setting?")) return;
      try {
        await deleteSeoSetting.mutateAsync(pageName);
        toast.success("SEO setting deleted.");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete SEO setting.";
        toast.error(msg);
      }
    },
    [deleteSeoSetting],
  );

  return (
    <>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">SEO Settings</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Setting
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
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
                No SEO settings found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((setting) => (
                <SeoCard
                  key={setting.page}
                  setting={setting}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteSeoSetting.isPending}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? "Edit SEO Setting" : "New SEO Setting"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Page *</Label>
              <Input
                value={form.page}
                onChange={(e) =>
                  setForm((f) => ({ ...f, page: e.target.value }))
                }
                placeholder="e.g. home, blog, projects"
                disabled={!!editingSetting}
              />
            </div>
            <div className="space-y-1">
              <Label>Meta Title *</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={setSeoSetting.isPending}>
              {setSeoSetting.isPending ? (
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
