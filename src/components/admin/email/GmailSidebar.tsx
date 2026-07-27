import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Inbox, Send, FileText, Star, Archive, Trash2, PenSquare,
  Users, LayoutTemplate, Megaphone, ShieldAlert
} from 'lucide-react';

export type EmailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'spam' | 'archive' | 'trash' | 'contacts' | 'templates' | 'bulk';

interface GmailSidebarProps {
  activeFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  onCompose: () => void;
  counts: {
    inbox: number;
    unread: number;
    starred: number;
    sent: number;
    drafts: number;
    spam: number;
    archive: number;
    trash: number;
    contacts: number;
  };
}

// Dark, saturated icon colors instead of the previous flat muted-foreground
// gray — chosen to read clearly against both the light sidebar background
// and the primary-colored active state.
const FOLDER_COLORS: Record<string, string> = {
  inbox: 'text-estate-blue',
  starred: 'text-estate-gold',
  sent: 'text-estate-purple',
  drafts: 'text-slate-600',
  spam: 'text-estate-red',
  archive: 'text-slate-700',
  trash: 'text-slate-800',
};

const TOOL_COLORS: Record<string, string> = {
  contacts: 'text-estate-blue',
  templates: 'text-estate-purple',
  bulk: 'text-estate-gold',
};

const GmailSidebar: React.FC<GmailSidebarProps> = ({
  activeFolder, onFolderChange, onCompose, counts
}) => {
  const folders: { id: EmailFolder; label: string; icon: React.ElementType; count?: number; badge?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox, badge: counts.unread },
    { id: 'starred', label: 'Starred', icon: Star, count: counts.starred },
    { id: 'sent', label: 'Sent', icon: Send, count: counts.sent },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: counts.drafts },
    { id: 'spam', label: 'Spam', icon: ShieldAlert, count: counts.spam },
    { id: 'archive', label: 'Archive', icon: Archive, count: counts.archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const tools: { id: EmailFolder; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'contacts', label: 'Contacts', icon: Users, count: counts.contacts },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'bulk', label: 'Bulk Email', icon: Megaphone },
  ];

  return (
    <div className="w-56 shrink-0 flex flex-col gap-1">
      <Button
        onClick={onCompose}
        className="mb-3 gap-2 rounded-2xl shadow-md h-12 text-base font-medium"
      >
        <PenSquare className="h-5 w-5" />
        Compose
      </Button>

      <div className="space-y-0.5">
        {folders.map(f => (
          <button
            key={f.id}
            onClick={() => onFolderChange(f.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
              activeFolder === f.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/30'
                : 'text-foreground hover:bg-white/60'
            }`}
          >
            <f.icon className={`h-4 w-4 shrink-0 ${activeFolder === f.id ? 'text-primary-foreground' : FOLDER_COLORS[f.id]}`} />
            <span className="flex-1 text-left truncate">{f.label}</span>
            {f.badge != null && f.badge > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{f.badge}</Badge>
            )}
            {f.count != null && !f.badge && f.count > 0 && (
              <span className="text-xs text-muted-foreground">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-0.5">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools</p>
        {tools.map(f => (
          <button
            key={f.id}
            onClick={() => onFolderChange(f.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
              activeFolder === f.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/30'
                : 'text-foreground hover:bg-white/60'
            }`}
          >
            <f.icon className={`h-4 w-4 shrink-0 ${activeFolder === f.id ? 'text-primary-foreground' : TOOL_COLORS[f.id]}`} />
            <span className="flex-1 text-left truncate">{f.label}</span>
            {f.count != null && f.count > 0 && (
              <span className="text-xs text-muted-foreground">{f.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GmailSidebar;
