"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();
  const patientId = formData.get("patientId") as string;
  const amountDue = parseFloat(formData.get("amount_due") as string);
  const amountPaid = parseFloat(formData.get("amount_paid") as string);
  const paymentMethod = formData.get("payment_method") as string;
  const receiptNumber = formData.get("receipt_number") as string;

  let status = "Unpaid";
  if (amountPaid >= amountDue) status = "Paid";
  else if (amountPaid > 0) status = "Partial";

  await supabase.from("invoices").insert([
    {
      patient_id: patientId,
      amount_due: amountDue,
      amount_paid: amountPaid,
      payment_method: paymentMethod || null,
      receipt_number: receiptNumber || null,
      status: status,
    },
  ]);

  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath(`/dashboard/financials`);
}

export async function updatePatientProfile(formData: FormData) {
  const supabase = await createClient();
  const patientId = formData.get("patient_id") as string;

  const updates = {
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || null,
  };

  const rawMedicalHistory = formData.get("medical_history") as string;
  if (rawMedicalHistory !== null) {
    try {
      // If it's passed as a JSON string
      (updates as any).medical_history = JSON.parse(rawMedicalHistory);
    } catch {
      // Fallback
      (updates as any).medical_history = rawMedicalHistory;
    }
  }

  const alerts = formData.get("medical_alerts") as string;
  if (alerts !== null) {
    (updates as any).medical_alerts = alerts;
  }

  const { error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", patientId);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("حدث خطأ أثناء حفظ البيانات");
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
}
