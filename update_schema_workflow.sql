-- 1. Updates to Appointments table (Statuses and Financials)
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'Arrived';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'In Progress';

-- Add field to track if the checkup fee is paid at the reception
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS checkup_fee_paid BOOLEAN DEFAULT false;

-- Add field to link to the invoice if created during the session
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;

-- 2. Updates to Invoices table for Installments and Discounts
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 1;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_percentage_discount BOOLEAN DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS checkup_fee_deducted BOOLEAN DEFAULT false;

-- 3. Create Installments table (to track payments over sessions)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    session_number INTEGER NOT NULL,
    status TEXT DEFAULT 'Unpaid', -- 'Unpaid', 'Paid', 'Partial'
    payment_method TEXT, -- e.g., 'Cash', 'InstaPay', 'VodafoneCash', 'Installment'
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Run this line manually if the table already exists:
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Enable RLS for installments
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.installments;
CREATE POLICY "Enable all for authenticated users" ON public.installments FOR ALL USING (auth.role() = 'authenticated');
