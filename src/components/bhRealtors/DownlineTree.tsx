import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Users, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DownlineMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  is_pbo: boolean | null;
  pbo_referral_code: string | null;
  current_package: string | null;
  current_rank: string | null;
}

/**
 * Lazily-loaded unlimited-depth referral tree.
 * The tree shows network identity/status, not private contact details.
 * Commission eligibility is never calculated in the UI; the database
 * commission engine handles the 15% seller + 5% first-level-referrer rule.
 */
const DownlineNode: React.FC<{ member: DownlineMember; depth: number }> = ({ member, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [children, setChildren] = useState<DownlineMember[]>([]);

  const toggleExpand = async () => {
    if (!expanded && !loaded) {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at, is_pbo, pbo_referral_code, current_package, current_rank')
        .eq('referred_by_id', member.id)
        .order('created_at', { ascending: false });
      if (!error) setChildren(data || []);
      setLoaded(true);
      setLoading(false);
    }
    setExpanded((e) => !e);
  };

  const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unnamed member';
  const rank = member.current_rank || 'Associate';
  const packageLabel = member.current_package?.replace(/_/g, ' ') || 'associate';

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-white border border-slate-200 hover:border-estate-blue/30 transition-colors">
        <button
          type="button"
          onClick={toggleExpand}
          className="shrink-0 text-slate-400 hover:text-estate-blue transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-900 truncate">{name}</span>
            {member.is_pbo && <BadgeCheck className="h-3.5 w-3.5 text-estate-blue shrink-0" title="Registered PBO" />}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[11px] rounded-full bg-estate-blue/10 text-estate-blue px-2 py-0.5">{rank}</span>
            <span className="text-[11px] rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 capitalize">{packageLabel} package</span>
            <span className="text-[11px] text-slate-400">
              Joined {new Date(member.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${member.is_pbo ? 'bg-estate-blue/10 text-estate-blue' : 'bg-slate-100 text-slate-500'}`}>
          {member.is_pbo ? 'PBO' : 'Member'}
        </span>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2 border-l-2 border-slate-100 pl-2">
          {loading ? null : children.length === 0 ? (
            <p className="text-xs text-slate-400 py-1.5 pl-3">No referrals under {member.first_name || 'this member'} yet.</p>
          ) : (
            children.map((child) => <DownlineNode key={child.id} member={child} depth={depth + 1} />)
          )}
        </div>
      )}
    </div>
  );
};

interface DownlineTreeProps {
  rootUserId: string;
}

const DownlineTree: React.FC<DownlineTreeProps> = ({ rootUserId }) => {
  const [members, setMembers] = useState<DownlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at, is_pbo, pbo_referral_code, current_package, current_rank')
        .eq('referred_by_id', rootUserId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      else setMembers(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [rootUserId]);

  if (loading) {
    return <div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your referral tree…</div>;
  }

  if (error) {
    return <p className="text-sm text-slate-500 py-4">We couldn't load your referral tree right now. Try refreshing the page - if it keeps happening, contact support.</p>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Users className="mx-auto mb-2 opacity-50" size={28} />
        <p className="text-sm">No referrals yet. Share your referral link to start building your downline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500 mb-3">
        {members.length} direct {members.length === 1 ? 'referral' : 'referrals'}. Expand a member to see the next level of your network.
      </p>
      {members.map((member) => <DownlineNode key={member.id} member={member} depth={0} />)}
    </div>
  );
};

export default DownlineTree;
