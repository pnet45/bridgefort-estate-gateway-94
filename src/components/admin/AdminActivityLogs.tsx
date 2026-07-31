import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { 
  Activity, 
  User, 
  Building, 
  Mail, 
  UserCheck, 
  Trash2, 
  Edit, 
  Plus,
  FileText,
  Settings,
  Loader2,
  Search,
  X,
  ArrowUpDown
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ActivityLog {
  id: string;
  admin_id: string | null;
  action_type: string;
  action_description: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'user_created':
    case 'user_updated':
    case 'user_deleted':
      return <User className="h-4 w-4" />;
    case 'property_created':
    case 'property_updated':
    case 'property_deleted':
      return <Building className="h-4 w-4" />;
    case 'email_sent':
      return <Mail className="h-4 w-4" />;
    case 'admin_approved':
    case 'admin_rejected':
      return <UserCheck className="h-4 w-4" />;
    case 'delete':
      return <Trash2 className="h-4 w-4" />;
    case 'edit':
      return <Edit className="h-4 w-4" />;
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'post_created':
    case 'post_updated':
      return <FileText className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActionColor = (actionType: string) => {
  if (actionType.includes('deleted') || actionType.includes('rejected')) {
    return 'text-red-400 bg-red-900/20';
  }
  if (actionType.includes('created') || actionType.includes('approved')) {
    return 'text-green-400 bg-green-900/20';
  }
  if (actionType.includes('updated') || actionType.includes('sent')) {
    return 'text-blue-400 bg-blue-900/20';
  }
  return 'text-slate-400 bg-slate-700/50';
};

export const logAdminActivity = async (
  action_type: string,
  action_description: string,
  entity_type?: string,
  entity_id?: string,
  metadata?: Record<string, any>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('admin_activity_logs').insert({
    admin_id: user.id,
    action_type,
    action_description,
    entity_type,
    entity_id,
    metadata
  });
};

const PAGE_SIZE = 20;

const AdminActivityLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  // Debounce the free-text search so we don't hit the DB on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionTypeFilter, entityTypeFilter, dateFrom, dateTo, sortOrder]);

  // Populate filter dropdowns from whatever values actually exist in the table
  useEffect(() => {
    const loadFilterOptions = async () => {
      const { data } = await supabase
        .from('admin_activity_logs')
        .select('action_type, entity_type')
        .limit(1000);
      if (data) {
        setActionTypes(Array.from(new Set(data.map(d => d.action_type).filter(Boolean))).sort());
        setEntityTypes(Array.from(new Set(data.map(d => d.entity_type).filter(Boolean))).sort() as string[]);
      }
    };
    loadFilterOptions();
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          profiles:admin_id (first_name, last_name)
        `, { count: 'exact' });

      if (debouncedSearch) {
        query = query.ilike('action_description', `%${debouncedSearch}%`);
      }
      if (actionTypeFilter !== 'all') {
        query = query.eq('action_type', actionTypeFilter);
      }
      if (entityTypeFilter !== 'all') {
        query = query.eq('entity_type', entityTypeFilter);
      }
      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom + 'T00:00:00').toISOString());
      }
      if (dateTo) {
        query = query.lte('created_at', new Date(dateTo + 'T23:59:59').toISOString());
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, actionTypeFilter, entityTypeFilter, dateFrom, dateTo, sortOrder, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Live updates: only auto-refresh when viewing the first page of the
  // default (unfiltered, newest-first) view, so a new row doesn't yank
  // someone out of a filtered search or a page they're reading through.
  useEffect(() => {
    const isDefaultView =
      page === 1 && sortOrder === 'desc' && !debouncedSearch &&
      actionTypeFilter === 'all' && entityTypeFilter === 'all' && !dateFrom && !dateTo;
    if (!isDefaultView) return;

    const channel = supabase
      .channel('activity-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_activity_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, sortOrder, debouncedSearch, actionTypeFilter, entityTypeFilter, dateFrom, dateTo, fetchLogs]);

  const getAdminName = (log: ActivityLog) => {
    if (log.profiles?.first_name || log.profiles?.last_name) {
      return `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim();
    }
    return 'Unknown Admin';
  };

  const hasActiveFilters = debouncedSearch || actionTypeFilter !== 'all' || entityTypeFilter !== 'all' || dateFrom || dateTo;
  const clearFilters = () => {
    setSearch('');
    setActionTypeFilter('all');
    setEntityTypeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-900/30 rounded-lg">
          <Activity className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
        <span className="text-sm text-slate-400 ml-auto">{totalCount} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity description..."
            className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            aria-label="Search activity logs"
          />
        </div>

        <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
          <SelectTrigger className="w-[170px] bg-slate-700/50 border-slate-600 text-white">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All action types</SelectItem>
            {actionTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="w-[170px] bg-slate-700/50 border-slate-600 text-white">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entity types</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white w-[150px]"
            aria-label="From date"
            max={dateTo || undefined}
          />
          <span className="text-slate-500 text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white w-[150px]"
            aria-label="To date"
            min={dateFrom || undefined}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
          className="gap-2 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
        </Button>

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          {hasActiveFilters ? 'No activity logs match these filters.' : 'No activity logs yet'}
        </p>
      ) : (
        <>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getActionColor(log.action_type)}`}>
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{log.action_description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        by {getAdminName(log)}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {log.entity_type && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-600/50 text-slate-300 text-xs rounded">
                        {log.entity_type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-slate-400 px-3">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default AdminActivityLogs;
