ALTER POLICY "Admins can view all gallery media" ON public.gallery_media_items TO authenticated;
ALTER POLICY "Admins can insert gallery media" ON public.gallery_media_items TO authenticated;
ALTER POLICY "Admins can update gallery media" ON public.gallery_media_items TO authenticated;
ALTER POLICY "Admins can delete gallery media" ON public.gallery_media_items TO authenticated;

ALTER POLICY "Admins can view all content" ON public.content_items TO authenticated;

ALTER POLICY "Admins can view all center training bookings" ON public.centertraining TO authenticated;
ALTER POLICY "Admins can view all contact submissions" ON public.contact_submissions TO authenticated;

ALTER POLICY "admin_permissions_write_admins" ON public.admin_permissions TO authenticated;
ALTER POLICY "admin_permissions_select_own" ON public.admin_permissions TO authenticated;
ALTER POLICY "admin_roles_write_admins" ON public.admin_roles TO authenticated;
ALTER POLICY "admin_roles_select_own" ON public.admin_roles TO authenticated;
ALTER POLICY "mail_settings_write_own" ON public.mail_settings TO authenticated;
ALTER POLICY "mail_settings_access_own" ON public.mail_settings TO authenticated;
ALTER POLICY "mail_sync_status_write_own" ON public.mail_sync_status TO authenticated;
ALTER POLICY "mail_sync_status_access_own" ON public.mail_sync_status TO authenticated;
ALTER POLICY "user_roles_select_own" ON public.user_roles TO authenticated;
