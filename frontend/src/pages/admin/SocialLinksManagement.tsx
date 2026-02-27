import { useState } from 'react';
import {
  useGetSocialLinks, useCreateSocialLink, useUpdateSocialLink,
  useToggleSocialLink, useDeleteSocialLink
} from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import AdminSidebar from '../../components/AdminSidebar';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialPlatform } from '../../backend';
import type { SocialLink } from '../../backend';

const ITEMS_PER_PAGE = 10;

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  if (isInitializing || isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!identity || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2><Link to="/admin" className="text-primary hover:underline">Go to Login</Link></div></div>;
  return <>{children}</>;
}

export default function SocialLinksManagement() {
  const { data: socialLinks, isLoading } = useGetSocialLinks();
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  const toggleMutation = useToggleSocialLink();
  const deleteMutation = useDeleteSocialLink();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: SocialPlatform.github, url: '', icon: '' });

  const filtered = (socialLinks ?? []).filter((l) =>
    l.platform.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const openCreate = () => {
    setEditing(null);
    setForm({ platform: SocialPlatform.github, url: '', icon: '' });
    setShowForm(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditing(link);
    setForm({ platform: link.platform, url: link.url, icon: link.icon });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { toast.error('URL is required.'); return; }
    if (editing) {
      updateMutation.mutate({ id: BigInt(editing.id), url: form.url, icon: form.icon }, {
        onSuccess: () => { toast.success('Social link updated!'); setShowForm(false); },
        onError: () => toast.error('Failed to update social link.'),
      });
    } else {
      createMutation.mutate({ platform: form.platform, url: form.url, icon: form.icon || form.platform }, {
        onSuccess: () => { toast.success('Social link created!'); setShowForm(false); },
        onError: () => toast.error('Failed to create social link.'),
      });
    }
  };

  const handleToggle = (id: bigint) => {
    toggleMutation.mutate(id, {
      onSuccess: () => toast.success('Visibility toggled!'),
      onError: () => toast.error('Failed to toggle link.'),
    });
  };

  const handleDelete = (id: bigint) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Social link deleted!'),
      onError: () => toast.error('Failed to delete social link.'),
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
                <h1 className="text-3xl font-bold text-foreground">Social Links</h1>
                <p className="text-muted-foreground mt-1">Manage your social media profiles</p>
              </div>
              <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Add Link</Button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{editing ? 'Edit Social Link' : 'New Social Link'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editing && (
                    <div>
                      <Label>Platform</Label>
                      <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as SocialPlatform })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SocialPlatform.github}>GitHub</SelectItem>
                          <SelectItem value={SocialPlatform.linkedin}>LinkedIn</SelectItem>
                          <SelectItem value={SocialPlatform.x}>X (Twitter)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="social-url">URL</Label>
                    <Input
                      id="social-url"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://github.com/username"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="social-icon">Icon (optional label)</Label>
                    <Input
                      id="social-icon"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="GitHub"
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
                placeholder="Search by platform..."
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
                <Share2 size={40} className="mx-auto mb-3 opacity-30" />
                <p>No social links found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((link) => (
                  <div key={String(link.id)} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground capitalize">{link.platform}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${link.isActive ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={() => handleToggle(BigInt(link.id))}
                        aria-label={`Toggle ${link.platform} link`}
                      />
                      <Button size="icon" variant="ghost" onClick={() => openEdit(link)} aria-label={`Edit ${link.platform}`}>
                        <Pencil size={15} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${link.platform}`}>
                            <Trash2 size={15} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Social Link</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the {link.platform} link?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(BigInt(link.id))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
