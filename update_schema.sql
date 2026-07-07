-- Run this in your Supabase SQL Editor

-- 1. Add compound salary support to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS percentage_value DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deduction_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary_system TEXT DEFAULT 'Fixed'; -- 'Fixed', 'Percentage', or 'Both'

-- 2. Ensure Inventory table exists and is ready
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0 NOT NULL,
    unit TEXT,
    expiration_date DATE,
    minimum_stock_level INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
