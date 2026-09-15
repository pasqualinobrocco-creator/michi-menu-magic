CREATE POLICY "anyone can read branding" ON storage.objects FOR SELECT USING (bucket_id = 'branding');
CREATE POLICY "staff can upload branding" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'branding');
CREATE POLICY "staff can update branding" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'branding') WITH CHECK (bucket_id = 'branding');
CREATE POLICY "staff can delete branding" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'branding');