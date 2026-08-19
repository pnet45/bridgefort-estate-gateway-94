import React from 'react';
import { Check, ChevronDown, Mail, RefreshCw, Unplug, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export interface MailboxSwitcherItem {
  mailbox_email: string;
  mailbox_provider?: 'gmail' | 'resend' | string;
  gmail_connected?: boolean;
  connected_accounts?: string[];
}

interface Props {
  value: string | null;
  mailboxes: MailboxSwitcherItem[];
  onChange: (email: string) => void;
  onConnect?: (email: string) => void;
  onDisconnect?: (email: string) => void;
  connecting?: string | null;
  disconnecting?: string | null;
  disabled?: boolean;
}

export default function MailboxSwitcher({
  value, mailboxes, onChange, onConnect, onDisconnect,
  connecting, disconnecting, disabled,
}: Props) {
  const current = mailboxes.find(m => m.mailbox_email === value);
  return (
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-10 min-w-[260px] max-w-[42vw] justify-between gap-3 rounded-full border-slate-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl hover:bg-white"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Mail className="h-3.5 w-3.5 text-slate-600" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-xs font-semibold text-slate-800">
                  {current?.mailbox_email || 'Select mailbox'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {current ? (current.mailbox_provider === 'gmail' ? 'Gmail mailbox' : 'Resend mailbox') : 'Choose a connected mailbox'}
                </span>
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="center" className="w-[360px] rounded-2xl border-slate-200/80 bg-white/95 p-1 shadow-2xl backdrop-blur-xl">
          <Command>
            <CommandInput placeholder="Search mailbox..." />
            <CommandList>
              <CommandEmpty>No accessible mailboxes.</CommandEmpty>
              <CommandGroup heading="Your mailboxes">
                {mailboxes.map(mailbox => {
                  const selected = mailbox.mailbox_email === value;
                  const connected = mailbox.mailbox_provider === 'gmail' ? !!mailbox.gmail_connected : true;
                  return (
                    <CommandItem
                      key={`${mailbox.mailbox_provider}:${mailbox.mailbox_email}`}
                      value={mailbox.mailbox_email}
                      onSelect={() => onChange(mailbox.mailbox_email)}
                      className="my-0.5 rounded-xl px-3 py-2.5"
                    >
                      <span className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <Mail className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{mailbox.mailbox_email}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="h-5 rounded-full px-1.5 text-[9px]">
                            {mailbox.mailbox_provider === 'gmail' ? 'Gmail' : 'Resend'}
                          </Badge>
                          {mailbox.mailbox_provider === 'gmail' && (
                            <span className={`text-[9px] ${connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {connected ? `${mailbox.connected_accounts?.length || 0} Google account${(mailbox.connected_accounts?.length || 0) === 1 ? '' : 's'} connected` : 'Not connected'}
                            </span>
                          )}
                        </span>
                      </span>
                      {selected && <Check className="ml-2 h-4 w-4 text-emerald-600" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {value && current?.mailbox_provider === 'gmail' && (
                <CommandGroup heading="Connection">
                  <div className="flex items-center gap-2 px-3 pb-2 pt-1">
                    {onConnect && (
                      <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg text-xs" disabled={!!connecting}
                        onClick={() => onConnect(value)}>
                        {connecting === value ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
                        Connect account
                      </Button>
                    )}
                    {onDisconnect && (
                      <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        disabled={!!disconnecting} onClick={() => onDisconnect(value)}>
                        {disconnecting === value ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Unplug className="mr-1.5 h-3.5 w-3.5" />}
                        Disconnect
                      </Button>
                    )}
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
