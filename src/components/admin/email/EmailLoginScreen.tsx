import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plug, Loader2, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';

export interface AvailableMailbox {
  mailbox_email: string;
  mailbox_provider: string;
  is_connected: boolean;
}

interface EmailLoginScreenProps {
  mailboxes: AvailableMailbox[];
  loading: boolean;
  activeMailbox: string | null;
  connectingEmail: string | null;
  disconnectingEmail: string | null;
  onSelect: (mailboxEmail: string) => void;
  onConnectGmail: (mailboxEmail: string) => void;
  onDisconnectGmail: (mailboxEmail: string) => void;
}

/**
 * The "Email Login" screen the spec asks for: clicking into Email Center
 * lands here first instead of auto-opening an inbox. Only mailboxes this
 * admin is actually authorized for (via admin_mailboxes / admin:all) show
 * up at all — get_available_mailboxes() is the enforcement, this is just
 * the picker on top of it.
 */
export default function EmailLoginScreen({
  mailboxes,
  loading,
  activeMailbox,
  connectingEmail,
  disconnectingEmail,
  onSelect,
  onConnectGmail,
  onDisconnectGmail,
}: EmailLoginScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Email Center</h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Sign in to a mailbox to continue. You can switch between any of your authorized accounts without signing out.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : mailboxes.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10">
            No mailboxes are assigned to your account yet. Ask an administrator to grant you access.
          </div>
        ) : (
          <div className="space-y-2">
            {mailboxes.map((mb) => {
              const isGmail = mb.mailbox_provider === 'gmail';
              const needsConnect = isGmail && !mb.is_connected;
              const isConnecting = connectingEmail === mb.mailbox_email;
              const isDisconnecting = disconnectingEmail === mb.mailbox_email;
              const isActive = activeMailbox === mb.mailbox_email;

              return (
                <div
                  key={`${mb.mailbox_provider}-${mb.mailbox_email}`}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    isActive ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{mb.mailbox_email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] capitalize">{mb.mailbox_provider}</Badge>
                      {isGmail && (
                        <span className={`text-[11px] flex items-center gap-1 ${mb.is_connected ? 'text-green-600' : 'text-slate-400'}`}>
                          {mb.is_connected ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {mb.is_connected ? 'Connected' : 'Not connected'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {needsConnect ? (
                      <Button
                        size="sm"
                        onClick={() => onConnectGmail(mb.mailbox_email)}
                        disabled={isConnecting}
                        className="gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={isActive ? 'secondary' : 'default'}
                          onClick={() => onSelect(mb.mailbox_email)}
                          className="gap-1.5 rounded-full"
                        >
                          {isActive ? 'Current' : 'Sign In'}
                          {!isActive && <ArrowRight className="h-3.5 w-3.5" />}
                        </Button>
                        {isGmail && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDisconnectGmail(mb.mailbox_email)}
                            disabled={isDisconnecting}
                            title="Sign out this account"
                            className="text-slate-400 hover:text-red-500"
                          >
                            {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
