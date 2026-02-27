import React from 'react';
import { Trash2, Loader2, Users, Mail, MessageSquare, Calendar } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import { useGetLeads, useLeadMutations } from '../../hooks/useQueries';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

function LeadsContent() {
  const { data: leads, isLoading } = useGetLeads();
  const { deleteLead } = useLeadMutations();

  const handleDelete = async (id: bigint) => {
    try {
      await deleteLead.mutateAsync(id);
      toast.success('Lead deleted.');
    } catch {
      toast.error('Failed to delete lead.');
    }
  };

  return (
    <div className="pt-24 section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors mb-1 block">← Dashboard</Link>
          <h1 className="font-display font-bold text-2xl">Leads Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Contact form submissions from potential clients.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : leads && leads.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No leads yet. They'll appear here when someone fills out the contact form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads?.map((lead) => (
              <div key={lead.id.toString()} className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-xs">{lead.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-sm">{lead.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">{lead.email}</a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(Number(lead.timestamp) / 1_000_000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{lead.message}</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                        <AlertDialogDescription>Delete the lead from "{lead.name}"? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(lead.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsManagement() {
  return <AdminGuard><LeadsContent /></AdminGuard>;
}
