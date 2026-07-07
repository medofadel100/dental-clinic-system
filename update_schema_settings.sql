-- Settings Table for Clinic Profile
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.clinic_settings (clinic_name, phone, address, start_time, end_time, slot_duration) 
VALUES ('لومينا ديجيتال', '01012345678', 'القاهرة، مدينة نصر', '10:00', '22:00', 30);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for authenticated users only" ON public.clinic_settings FOR ALL USING (auth.role() = 'authenticated');
