import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Users, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface DownlineMember {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  created_at?: string;
  joined_at?: string;
  is_pbo?: boolean | null;
  current_package: string | null;
  current_rank: string | null;
  is_active?: boolean | null;
}

const DownlineNode: React.FC<{ member: DownlineMember; depth: number }> = ({ member, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [children, setChildren] = useState<DownlineMember[]>([]);

  const toggleExpand = async () => {
    if (!expanded && !loaded) {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at, is_pbo, current_package, current_rank, is_active')
        .eq('referred_by_id', member.id)
        .order('created_at', { ascending: false });
      setChildren((data || []) as DownlineMember[]);
      setLoaded(true);
      setLoading(false);
    }
    setExpanded(v => !v);
  };

  const name = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unnamed member';
  const packageLabel = (member.current_package || 'associate').replace(/_/g, ' ');
  const joined = member.joined_at || member.created_at;

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 shadow-sm transition-colors hover:border-estate-blue/30 dark:border-white/10 dark:bg-slate-950/50">
        <button type="button" onClick={toggleExpand} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-estate-blue dark:hover:bg-white/5" aria-label={expanded ? 'Collapse member' : 'Expand member'}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium text-slate-900 dark:text-white">{name}</span>
            {member.is_pbo && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-estate-blue" />}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-estate-blue/10 px-2 py-0.5 text-[11px] text-estate-blue">{member.current_rank || 'Associate'}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-500 dark:bg-white/5 dark:text-slate-400">{packageLabel}</span>
            {joined && <span className="text-[11px] text-slate-400">Joined {new Date(joined).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${member.is_active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{member.is_active ? 'Active' : 'Inactive'}</span>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2 border-l-2 border-slate-100 pl-2 dark:border-white/10">
          {children.length ? children.map(child => <DownlineNode key={child.id} member={child} depth={depth + 1} />) : <p className="py-1.5 pl-3 text-xs text-slate-400">No referrals under {member.first_name || member.name || 'this member'} yet.</p>}
        </div>
      )}
    </div>
  );
};

interface DownlineTreeProps { rootUserId?: string; }

const DownlineTree: React.FC<DownlineTreeProps> = ({ rootUserId }) => {
  const { user } = useAuth();
  const rootId = rootUserId || user?.id;
  const [members, setMembers] = useState<DownlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rootId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      if (rootId === user?.id) {
        const { data, error: fetchError } = await supabase.rpc('get_my_bhrealtor_network_tree', { _limit: 200 });
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        else setMembers((Array.isArray(data) ? data : []) as DownlineMember[]);
      } else {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, created_at, is_pbo, current_package, current_rank, is_active')
          .eq('referred_by_id', rootId)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (fetchError) setError(fetchError.message);
        else setMembers((data || []) as DownlineMember[]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [rootId, user?.id]);

  if (loading) return <div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your referral network</div>;
  if (error) return <p className="py-4 text-sm text-slate-500">Your referral network could not be loaded right now. Refresh the dashboard to try again.</p>;
  if (!members.length) return <div className="py-8 text-center text-slate-400"><Users className="mx-auto h-8 w-8" /><p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">No direct referrals yet</p><p className="mt-1 text-xs">Use your referral link or QR code to start building your network.</p></div>;

  const activeCount = members.filter(member => member.is_active).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{members.length} direct {members.length === 1 ? 'referral' : 'referrals'}</p>
        <span className="text-xs text-emerald-700">{activeCount} active</span>
      </div>
      <div className="space-y-2">{members.map(member => <DownlineNode key={member.id} member={member} depth={0} />)}</div>
    </div>
  );
};

export default DownlineTree;
