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

const EmailListItem: React.FC<EmailListItemProps> = ({
  email, isSelected, isChecked, onSelect, onCheck, onStar
}) => {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border transition-colors group ${
        isSelected ? 'bg-primary/10' : email.is_read ? 'hover:bg-muted/40' : 'bg-muted/20 hover:bg-muted/40'
      }`}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={(c) => { onCheck(!!c); }}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
      <button
        onClick={(e) => { e.stopPropagation(); onStar(); }}
        className="shrink-0"
      >
        <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
      </button>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className={`w-40 shrink-0 truncate text-sm ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
          {email.from_name || email.from_email}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={`truncate text-sm ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {email.subject || '(No Subject)'}
          </span>
          <span className="text-sm text-muted-foreground truncate hidden md:inline">
            — {email.body?.substring(0, 80)}
          </span>
        </div>
        {email.has_attachments && <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </div>
      <span className={`text-xs shrink-0 ${!email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
        {formatEmailDate(email.created_at)}
      </span>
    </div>
  );
};

export default EmailListItem;
