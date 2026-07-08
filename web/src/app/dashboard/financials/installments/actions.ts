"use server";

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
  const { data: inst } = await supabase
    .from("installments")
    .select("*")
    .eq("id", installmentId)
    .single();
  if (!inst) throw new Error("لم يتم العثور على الدفعة");

  const newPaid = Number(inst.amount_paid || 0) + amountToPay;
  const newStatus = newPaid >= inst.amount_due ? "Paid" : "Partial";

  const { error } = await supabase
    .from("installments")
    .update({
      amount_paid: newPaid,
      status: newStatus,
      payment_date: new Date().toISOString(),
    })
    .eq("id", installmentId);

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ في الدفع");
  }

  // Update total invoice
  const { data: allInsts } = await supabase
    .from("installments")
    .select("amount_paid")
    .eq("invoice_id", inst.invoice_id);
  const totalPaid =
    allInsts?.reduce((sum, i) => sum + Number(i.amount_paid || 0), 0) || 0;

  await supabase
    .from("invoices")
    .update({ amount_paid: totalPaid })
    .eq("id", inst.invoice_id);

  // Add to expenses/income table (Assuming there is an income table or we just rely on invoices)
  // The system seems to use invoices directly, but we can also log to 'expenses' as a positive amount if that's how it's done.
  // For now, updating the installment and invoice is sufficient.

  revalidatePath("/dashboard/financials/installments");
}

export async function addClinicDebt(formData: FormData) {
  const supabase = await createClient();
  const itemName = formData.get("item_name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDate = formData.get("due_date") as string;

  if (!itemName || isNaN(amount) || !dueDate) throw new Error("بيانات ناقصة");

  const { error } = await supabase.from("clinic_debts").insert({
    item_name: itemName,
    amount,
    due_date: dueDate,
  });

  if (error) {
    console.error(error);
    throw new Error("فشل إضافة المديونية");
  }
  revalidatePath("/dashboard/financials/installments");
}

export async function payClinicDebt(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("debt_id") as string;
  const paymentMethod = formData.get("payment_method") as string;
  const receiptNumber = formData.get("receipt_number") as string;

  if (!id || !paymentMethod) throw new Error("البيانات غير مكتملة");

  const { error } = await supabase
    .from("clinic_debts")
    .update({
      is_paid: true,
      payment_method: paymentMethod,
      receipt_number: receiptNumber,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("فشل تسديد المديونية");
  }
  revalidatePath("/dashboard/financials/installments");
}
