import { supabase } from '@/integrations/supabase/client';

// The admin Activity Logs viewer (with its real-time subscription) already
// existed and worked — but nothing anywhere in the app ever actually wrote a
// row to admin_activity_logs, so it was always empty. This is the missing
// other half: a single helper to call from admin action handlers.
export const logAdminActivity = async (params: {
  actionType: string;
  actionDescription: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_activity_logs').insert({
      admin_id: user?.id || null,
      action_type: params.actionType,
      action_description: params.actionDescription,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      metadata: params.metadata || null,
    });
  } catch (err) {
    // Logging failures should never block the actual admin action.
    console.error('Error logging admin activity:', err);
  }
};
