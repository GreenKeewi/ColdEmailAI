-- Storage buckets for file uploads

-- Create lead_uploads bucket for CSV files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lead_uploads', 'lead_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create assets bucket for general assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lead_uploads
CREATE POLICY "Users can upload their own leads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead_uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead_uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead_uploads' AND auth.role() = 'authenticated');

-- Storage policies for assets
CREATE POLICY "Public can view assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');
