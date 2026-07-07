-- Phase 12 Updates (Idempotent Version)

-- 1. Create Services Catalog Table
CREATE TABLE IF NOT EXISTS public.services_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS safely
DO $$ BEGIN
    ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN END $$;

-- Create policy safely
DO $$ BEGIN
    CREATE POLICY "Enable read/write for authenticated users only" ON public.services_catalog FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN END $$;

-- 2. Update Profiles (Add is_doctor boolean)
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN is_doctor BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN END $$;

-- Set existing Doctors to true
UPDATE public.profiles SET is_doctor = true WHERE role = 'Doctor';

-- 3. Update Appointments (Add service_id and is_walk_in)
DO $$ BEGIN
    ALTER TABLE public.appointments ADD COLUMN service_id UUID REFERENCES public.services_catalog(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN END $$;

DO $$ BEGIN
    ALTER TABLE public.appointments ADD COLUMN is_walk_in BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN END $$;


-- 4. Update Sessions
-- Create Type safely
DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('Fixed', 'Percentage');
EXCEPTION WHEN duplicate_object THEN END $$;

DO $$ BEGIN
    ALTER TABLE public.sessions ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN END $$;

DO $$ BEGIN
    ALTER TABLE public.sessions ADD COLUMN service_id UUID REFERENCES public.services_catalog(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN END $$;

DO $$ BEGIN
    ALTER TABLE public.sessions ADD COLUMN discount_type discount_type_enum;
EXCEPTION WHEN duplicate_column THEN END $$;

DO $$ BEGIN
    ALTER TABLE public.sessions ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0.00;
EXCEPTION WHEN duplicate_column THEN END $$;
