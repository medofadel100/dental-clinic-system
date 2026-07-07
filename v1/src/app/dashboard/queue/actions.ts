'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markAsArrived(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;
  const checkupPaid = formData.get("checkup_paid") === "true";

  if (!appointmentId) throw new Error("بيانات غير مكتملة");

  const { error } = await supabase
    .from('appointments')
    .update({ 
      status: 'Arrived',
      checkup_fee_paid: checkupPaid 
    })
    .eq('id', appointmentId);

  if (error) {
    console.error("Error marking as arrived:", error);
    throw new Error("حدث خطأ أثناء تسجيل الحضور");
  }

  revalidatePath("/dashboard/queue");
}

export async function markAsInProgress(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;

  if (!appointmentId) throw new Error("بيانات غير مكتملة");

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'In Progress' })
    .eq('id', appointmentId);

  if (error) {
    console.error("Error marking as in progress:", error);
    throw new Error("حدث خطأ أثناء بدء الجلسة");
  }

  revalidatePath("/dashboard/queue");
}

export async function collectPayment(formData: FormData) {
  const supabase = await createClient();
  const invoiceId = formData.get("invoice_id") as string;
  const installmentId = formData.get("installment_id") as string;
  const amountStr = formData.get("amount") as string;
  const paymentMethod = formData.get("payment_method") as string;

  if (!invoiceId || !installmentId || !amountStr || !paymentMethod) {
    throw new Error("بيانات الدفع غير مكتملة");
  }

  const amount = parseFloat(amountStr);

  // 1. Update Installment
  const { error: installmentError } = await supabase
    .from('installments')
    .update({ 
      status: 'Paid',
      amount_paid: amount,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', installmentId);

  if (installmentError) {
    console.error("Error updating installment:", installmentError);
    throw new Error("حدث خطأ أثناء تحديث القسط");
  }

  // 2. Update Invoice Total Paid
  const { data: invoice } = await supabase
    .from('invoices')
    .select('amount_paid, amount_due')
    .eq('id', invoiceId)
    .single();

  if (invoice) {
    const newAmountPaid = Number(invoice.amount_paid || 0) + amount;
    const newStatus = newAmountPaid >= invoice.amount_due ? 'Paid' : 'Partial';

    await supabase
      .from('invoices')
      .update({ 
        amount_paid: newAmountPaid,
        status: newStatus
      })
      .eq('id', invoiceId);
  }

  revalidatePath("/dashboard/queue");
  revalidatePath("/dashboard/financials");
}
