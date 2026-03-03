import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mail,
  MessageSquare,
  Search,
  Trash2,
  User,
} from "lucide-react";
import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { toast } from "sonner";
import type { Lead } from "../../backend";
import { useDeleteLead, useGetLeads } from "../../hooks/useQueries";

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

interface LeadCardProps {
  lead: Lead;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
  formatDate: (ts: bigint) => string;
}

const LeadCard = memo(
  ({ lead, onDelete, isDeleting, formatDate }: LeadCardProps) => (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {lead.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {lead.email}
            </p>
            <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{lead.message}</span>
            </p>
            <p className="text-xs text-muted-foreground/60">
              {formatDate(lead.timestamp)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive flex-shrink-0 ml-2"
            onClick={() => onDelete(lead.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  ),
);

export default function LeadsManagement() {
  const { data: leads = [], isLoading } = useGetLeads();
  const deleteLead = useDeleteLead();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);
  const [page, setPage] = useState(1);

  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearch.current !== debouncedSearch) {
      setPage(1);
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      l.message.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!confirm("Delete this lead?")) return;
      try {
        await deleteLead.mutateAsync(id);
        toast.success("Lead deleted.");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete lead.";
        toast.error(msg);
      }
    },
    [deleteLead],
  );

  const formatDate = useCallback((timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <span className="text-sm text-muted-foreground">
            {leads.length} total
          </span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
              No leads found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {paginated.map((lead) => (
              <LeadCard
                key={String(lead.id)}
                lead={lead}
                onDelete={handleDelete}
                isDeleting={deleteLead.isPending}
                formatDate={formatDate}
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
  );
}
