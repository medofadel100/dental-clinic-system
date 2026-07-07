'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function endSession(formData: FormData) {
  const supabase = await createClient();
  
  const appointmentId = formData.get("appointment_id") as string;
  const patientId = formData.get("patient_id") as string;
  
  // Clinical
  const treatmentNotes = formData.get("treatment_notes") as string;
  const nextVisitNotes = formData.get("next_visit_notes") as string;
  
  // Financial
  const totalCost = parseFloat(formData.get("total_cost") as string || "0");
  const discountType = formData.get("discount_type") as string; // 'Fixed' | 'Percentage'
  const discountValue = parseFloat(formData.get("discount_value") as string || "0");
  const deductCheckupFee = formData.get("deduct_checkup_fee") === "true";
  const totalSessions = parseInt(formData.get("total_sessions") as string || "1", 10);
  const odontogramDataRaw = formData.get("odontogram_data") as string;

  if (!appointmentId || !patientId) throw new Error("بيانات الجلسة غير مكتملة");

  // Save Odontogram Data
  if (odontogramDataRaw) {
    try {
      const odontogramData = JSON.parse(odontogramDataRaw);
      await supabase
        .from('patients')
        .update({ odontogram_data: odontogramData })
        .eq('id', patientId);
    } catch (err) {
      console.error("Error parsing odontogram data:", err);
    }
  }

  // Create Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      patient_id: patientId,
      amount_due: totalCost,
      amount_paid: 0,
      status: 'Unpaid',
      total_sessions: totalSessions,
      discount_value: discountValue,
      is_percentage_discount: discountType === 'Percentage',
      checkup_fee_deducted: deductCheckupFee
    })
    .select()
    .single();

  if (invoiceError) {
    console.error(invoiceError);
    throw new Error("حدث خطأ في إنشاء الفاتورة");
  }

  // Generate Installments based on sessions
  if (totalCost > 0 && totalSessions > 0) {
    let finalCost = totalCost;
    
    if (discountValue > 0) {
      if (discountType === 'Percentage') {
        finalCost = finalCost - (finalCost * (discountValue / 100));
      } else {
        finalCost = finalCost - discountValue;
      }
    }
    
    // Checkup fee logic (Assuming checkup is 300)
    // If deductCheckupFee is true, the receptionist will collect 300 less in the total
    // We will just store the amount_due per session
    const perSessionCost = finalCost / totalSessions;
    
    const installments = [];
    for (let i = 1; i <= totalSessions; i++) {
      installments.push({
        invoice_id: invoice.id,
        patient_id: patientId,
        amount_due: perSessionCost,
        amount_paid: 0,
        session_number: i,
        status: 'Unpaid'
      });
    }

    const { error: installError } = await supabase.from('installments').insert(installments);
    if (installError) console.error("Error creating installments:", installError);
  }

  // Create Treatment Record
  const { error: treatmentError } = await supabase
    .from("treatments")
    .insert({
      patient_id: patientId,
      treatment_plan: treatmentNotes,
      status: 'Completed',
      cost: totalCost
    });

  if (treatmentError) console.error("Error creating treatment:", treatmentError);

  // Update Appointment to Completed and link Invoice
  const { error: apptError } = await supabase
    .from("appointments")
    .update({ 
      status: 'Completed',
      invoice_id: invoice.id,
      notes: nextVisitNotes ? `ملاحظات الزيارة القادمة: ${nextVisitNotes}` : null
    })
    .eq('id', appointmentId);

  if (apptError) console.error("Error completing appt:", apptError);

  revalidatePath("/dashboard/queue");
  revalidatePath(`/dashboard/patients/${patientId}`);
  
  redirect(`/dashboard/patients/${patientId}`);
}
