import React from 'react';
import { Archive, CheckSquare, Filter, MoreHorizontal, RefreshCw, Search, SlidersHorizontal, Trash2, MailOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  search: string;
  onSearch: (value: string) => void;
  checkedCount: number;
  totalCount: number;
  unreadOnly: boolean;
  onUnreadOnly: (value: boolean) => void;
  onRefresh: () => void;
  onArchive?: () => void;
  onTrash?: () => void;
  onMarkRead?: () => void;
  onMarkUnread?: () => void;
  onSelectAll?: () => void;
  refreshing?: boolean;
}

export default function GmailLikeToolbar({
  search, onSearch, checkedCount, totalCount, unreadOnly, onUnreadOnly,
  onRefresh, onArchive, onTrash, onMarkRead, onMarkUnread, onSelectAll, refreshing,
}: Props) {
  return (
    <div className="flex min-h-14 items-center gap-2 border-b border-slate-200/70 bg-white/80 px-3 backdrop-blur-xl">
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onSelectAll} title="Select all">
        <CheckSquare className="h-4 w-4" />
      </Button>
      <div className="h-5 w-px bg-slate-200" />

      <div className="relative min-w-0 flex-1 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search mail"
          className="h-10 rounded-full border-0 bg-slate-100/90 pl-9 pr-4 shadow-none focus-visible:ring-2 focus-visible:ring-slate-200"
        />
      </div>

      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onRefresh} title="Refresh">
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      </Button>

      {checkedCount > 0 && (
        <>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onArchive} title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-rose-600" onClick={onTrash} title="Move to trash">
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="More mail actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuItem onClick={() => onUnreadOnly(!unreadOnly)}>
            {unreadOnly ? <MailOpen className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
            {unreadOnly ? 'Show all mail' : 'Show unread only'}
          </DropdownMenuItem>
          {checkedCount > 0 && onMarkRead && <DropdownMenuItem onClick={onMarkRead}>Mark as read</DropdownMenuItem>}
          {checkedCount > 0 && onMarkUnread && <DropdownMenuItem onClick={onMarkUnread}>Mark as unread</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled><SlidersHorizontal className="mr-2 h-4 w-4" />Display density</DropdownMenuItem>
          <DropdownMenuItem disabled><Filter className="mr-2 h-4 w-4" />Advanced filters</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs text-slate-400">{totalCount.toLocaleString()} messages</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
