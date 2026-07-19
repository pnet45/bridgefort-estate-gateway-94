import React from 'react';
import { format, isToday, isThisYear } from 'date-fns';
import { Star, Paperclip } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface UnifiedEmail {
  id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  html?: string;
  created_at: string;
  is_read: boolean;
  is_starred: boolean;
  folder: string;
  source: string;
  has_attachments?: boolean;
  thread_id?: string;
  _original?: any;
}

interface EmailListItemProps {
  email: UnifiedEmail;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
  onStar: () => void;
}

function formatEmailDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isThisYear(d)) return format(d, 'MMM d');
  return format(d, 'MMM d, yyyy');
}

const initialsFor = (name: string, email: string) => {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

const avatarPalette = [
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-fuchsia-500', 'bg-orange-500', 'bg-teal-500',
];
const avatarColorFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return avatarPalette[hash % avatarPalette.length];
};

const EmailListItem: React.FC<EmailListItemProps> = ({
  email, isSelected, isChecked, onSelect, onCheck, onStar
}) => {
  const displayName = email.from_name || email.from_email || 'Unknown';
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 mx-2 my-1 px-3 py-2.5 rounded-2xl cursor-pointer transition-all group ${
        isSelected
          ? 'bg-primary/15 shadow-md ring-1 ring-primary/30'
          : email.is_read ? 'hover:bg-white/70' : 'bg-white/60 hover:bg-white/80 shadow-sm'
      }`}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={(c) => { onCheck(!!c); }}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
      <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold ${avatarColorFor(displayName)}`}>
        {initialsFor(email.from_name, email.from_email)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {displayName}
          </span>
          <span className={`text-[11px] shrink-0 ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {formatEmailDate(email.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {email.subject || '(No Subject)'}
          </span>
          {email.has_attachments && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {email.body?.substring(0, 90)}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onStar(); }}
        className="shrink-0"
      >
        <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
      </button>
    </div>
  );
};

export default EmailListItem;
