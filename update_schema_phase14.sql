-- Phase 14 Updates (Idempotent Version)

-- 1. Add odontogram_data to patients
DO $$ BEGIN
    ALTER TABLE public.patients ADD COLUMN odontogram_data JSONB DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN END $$;

-- 2. Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medications TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS safely
DO $$ BEGIN
    ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN END $$;

-- Create policy safely
DO $$ BEGIN
    CREATE POLICY "Enable read/write for authenticated users only" ON public.prescriptions FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN END $$;
