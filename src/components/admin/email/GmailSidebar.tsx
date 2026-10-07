import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Send, FileText, Star, Archive, Trash2, PenSquare, Users, LayoutTemplate, Megaphone, ShieldAlert, Workflow, Activity, type LucideIcon } from 'lucide-react';

export type EmailFolder = 'inbox'|'starred'|'sent'|'drafts'|'spam'|'archive'|'trash'|'contacts'|'templates'|'bulk'|'automations'|'monitoring';

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

const FC: Record<string, string> = {
  inbox: 'text-estate-blue',
  starred: 'text-estate-gold',
  sent: 'text-estate-purple',
  drafts: 'text-slate-600',
  spam: 'text-estate-red',
  archive: 'text-slate-700',
  trash: 'text-slate-500'
};

const TC: Record<string, string> = {
  contacts: 'text-estate-blue',
  templates: 'text-estate-purple',
  bulk: 'text-estate-gold',
  automations: 'text-[#5b2a86]'
};

export default function GmailSidebar({
  activeFolder,
  onFolderChange,
  onCompose,
  counts
}: GmailSidebarProps) {
  const folders = [
    ['inbox', 'Inbox', Inbox, counts.inbox, counts.unread],
    ['starred', 'Starred', Star, counts.starred, 0],
    ['sent', 'Sent', Send, counts.sent, 0],
    ['drafts', 'Drafts', FileText, counts.drafts, 0],
    ['spam', 'Spam', ShieldAlert, counts.spam, 0],
    ['archive', 'Archive', Archive, counts.archive, 0],
    ['trash', 'Trash', Trash2, counts.trash, 0]
  ] as const;

  const tools = [
    ['contacts', 'Contacts', Users, counts.contacts],
    ['templates', 'Templates', LayoutTemplate, 0],
    ['bulk', 'Bulk Email', Megaphone, 0],
    ['automations', 'Client Automations', Workflow, 0],
    ['monitoring', 'Delivery Monitoring', Activity, 0]
  ] as const;

  type NavItem = readonly [EmailFolder, string, LucideIcon, number, number?];

  const row = (f: NavItem, tool = false) => {
    const Icon = f[2];
    return (
    <button
      key={f[0]}
      onClick={() => onFolderChange(f[0])}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
        activeFolder === f[0] ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${tool ? TC[f[0]] : FC[f[0]]}`} />
      <span className="flex-1 text-left">{f[1]}</span>
      {f[3] > 0 && <Badge variant="secondary">{f[3]}</Badge>}
      {f[4] > 0 && <Badge variant="default">{f[4]}</Badge>}
    </button>
    );
  };

  return (
    <div className="w-56 shrink-0 flex flex-col gap-1">
      <Button
        onClick={onCompose}
        className="mb-3 gap-2 rounded-2xl shadow-md h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white"
      >
        <PenSquare className="w-5 h-5" />
        Compose
      </Button>
      <div className="space-y-1">
        {folders.map((f) => row(f))}
      </div>
      <div className="border-t border-slate-200 pt-2 mt-2">
        {tools.map((t) => row(t, true))}
      </div>
    </div>
  );
}