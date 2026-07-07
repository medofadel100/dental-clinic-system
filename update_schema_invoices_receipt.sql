-- Run this in your Supabase SQL Editor
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- For Expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_method payment_method_enum;
