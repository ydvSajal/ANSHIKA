DROP POLICY IF EXISTS "notif_insert_any" ON public.notifications;
CREATE POLICY "notif_insert_self" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notes_bucket_read" ON storage.objects;
-- Public bucket files remain accessible via their public URL; we just don't allow listing.
