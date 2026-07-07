'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function payInstallment(formData: FormData) {
  const supabase = await createClient();
  const installmentId = formData.get("installment_id") as string;
  const amountToPay = parseFloat(formData.get("amount") as string);

  if (!installmentId || isNaN(amountToPay)) {
    throw new Error("بيانات غير صحيحة");
  }

  // Get current installment
  const { data: inst } = await supabase.from('installments').select('*').eq('id', installmentId).single();
  if (!inst) throw new Error("لم يتم العثور على الدفعة");

  const newPaid = Number(inst.amount_paid || 0) + amountToPay;
  const newStatus = newPaid >= inst.amount_due ? 'Paid' : 'Partial';

  const { error } = await supabase
    .from('installments')
    .update({ 
      amount_paid: newPaid, 
      status: newStatus,
      payment_date: new Date().toISOString()
    })
    .eq('id', installmentId);

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ في الدفع");
  }

  // Update total invoice
  const { data: allInsts } = await supabase.from('installments').select('amount_paid').eq('invoice_id', inst.invoice_id);
  const totalPaid = allInsts?.reduce((sum, i) => sum + Number(i.amount_paid || 0), 0) || 0;
  
  await supabase.from('invoices').update({ amount_paid: totalPaid }).eq('id', inst.invoice_id);

  // Add to expenses/income table (Assuming there is an income table or we just rely on invoices)
  // The system seems to use invoices directly, but we can also log to 'expenses' as a positive amount if that's how it's done. 
  // For now, updating the installment and invoice is sufficient.

  revalidatePath("/dashboard/financials/installments");
}
