CREATE TABLE IF NOT EXISTS public.clinic_debts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    payment_method TEXT,
    receipt_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clinic_debts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and write
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clinic_debts;
CREATE POLICY "Enable all for authenticated users" ON public.clinic_debts FOR ALL USING (auth.role() = 'authenticated');
