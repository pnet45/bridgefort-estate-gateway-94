import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const AdminActivityLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('activity-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_activity_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          profiles:admin_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminName = (log: ActivityLog) => {
    if (log.profiles?.first_name || log.profiles?.last_name) {
      return `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim();
    }
    return 'Unknown Admin';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-900/30 rounded-lg">
          <Activity className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No activity logs yet</p>
      ) : (
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
      )}
    </div>
  );
};

export default AdminActivityLogs;
