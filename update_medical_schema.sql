-- 1. Add Medical History to patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_history JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_alerts TEXT;

-- 2. Create Patient Media table (for X-Rays, before/after photos)
CREATE TABLE IF NOT EXISTS public.patient_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    media_type TEXT NOT NULL, -- e.g., 'X-Ray', 'Panorama', 'Before', 'After', 'Document'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for patient_media
ALTER TABLE public.patient_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON public.patient_media FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create Lab Orders table
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    lab_name TEXT NOT NULL,
    work_description TEXT NOT NULL, -- e.g., "Zirconia Crown on Tooth 36"
    sent_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    cost DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Received', 'Cancelled', 'Returned'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for lab_orders
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON public.lab_orders FOR ALL USING (auth.role() = 'authenticated');
