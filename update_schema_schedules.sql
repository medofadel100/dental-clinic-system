-- 1. Add working_days to clinic_settings if it doesn't exist
-- Days are 0 to 6 where 0 is Sunday, 1 is Monday, etc.
ALTER TABLE public.clinic_settings 
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '[0, 1, 2, 3, 4, 6]'::jsonb;

-- 2. Create doctor_schedules table
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(doctor_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for authenticated users only" ON public.doctor_schedules FOR ALL USING (auth.role() = 'authenticated');
