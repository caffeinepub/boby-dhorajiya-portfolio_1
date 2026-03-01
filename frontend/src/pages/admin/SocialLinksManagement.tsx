import React, { useState } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminSidebar from '../../components/AdminSidebar';
import {
  useGetSocialLinks,
  useAddSocialLink,
  useUpdateSocialLink,
  useToggleSocialLink,
  useDeleteSocialLink,
} from '../../hooks/useQueries';
import { type SocialLink, SocialPlatform } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const PLATFORMS = [
  { value: SocialPlatform.github, label: 'GitHub' },
  { value: SocialPlatform.linkedin, label: 'LinkedIn' },
  { value: SocialPlatform.x, label: 'X (Twitter)' },
];

function SocialLinksManagementContent() {
  const { data: socialLinks = [], isLoading } = useGetSocialLinks();
  const createSocialLink = useAddSocialLink();
  const updateSocialLink = useUpdateSocialLink();
  const toggleSocialLink = useToggleSocialLink();
  const deleteSocialLink = useDeleteSocialLink();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({
    platform: SocialPlatform.github as SocialPlatform,
    url: '',
    icon: '',
    isActive: true,
  });

  const filtered = socialLinks.filter(
    (l) =>
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      l.platform.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = () => {
    setEditingLink(null);
    setForm({ platform: SocialPlatform.github, url: '', icon: '', isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditingLink(link);
    setForm({ platform: link.platform, url: link.url, icon: link.icon, isActive: link.isActive });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.url) {
      toast.error('URL is required.');
      return;
    }
    try {
      if (editingLink) {
        await updateSocialLink.mutateAsync({
          id: editingLink.id,
          platform: editingLink.platform,
          url: form.url,
          icon: form.icon,
          isActive: form.isActive,
        });
        toast.success('Social link updated.');
      } else {
        await createSocialLink.mutateAsync({
          platform: form.platform,
          url: form.url,
          icon: form.icon,
          isActive: form.isActive,
        });
        toast.success('Social link created.');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save social link.');
    }
  };

  const handleToggle = async (link: SocialLink) => {
    try {
      await toggleSocialLink.mutateAsync(link);
    } catch {
      toast.error('Failed to toggle social link.');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this social link?')) return;
    try {
      await deleteSocialLink.mutateAsync(id);
      toast.success('Social link deleted.');
    } catch {
      toast.error('Failed to delete social link.');
    }
  };

  const isSaving = createSocialLink.isPending || updateSocialLink.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Social Links</h1>
            <Button onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" /> New Link
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                No social links found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginated.map((link) => (
                <Card key={String(link.id)}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={() => handleToggle(link)}
                        disabled={toggleSocialLink.isPending}
                      />
                      <div>
                        <CardTitle className="text-base capitalize">{link.platform}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(link)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(link.id)}
                        disabled={deleteSocialLink.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
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
            <DialogTitle>{editingLink ? 'Edit Social Link' : 'New Social Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm(f => ({ ...f, platform: v as SocialPlatform }))}
                disabled={!!editingLink}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>URL *</Label>
              <Input value={form.url} onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Icon</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. github, linkedin"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm(f => ({ ...f, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
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

export default function SocialLinksManagement() {
  return (
    <AdminGuard>
      <SocialLinksManagementContent />
    </AdminGuard>
  );
}
