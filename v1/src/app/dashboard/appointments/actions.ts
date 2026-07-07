'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAppointment(formData: FormData) {
  const supabase = await createClient();
  
  const patientId = formData.get("patient_id") as string;
  const doctorId = formData.get("doctor_id") as string;
  const rawAppointmentDate = formData.get("appointment_date") as string;
  const isWalkIn = formData.get("is_walk_in") === "true";
  const serviceId = formData.get("service_id") as string;
  const notes = formData.get("notes") as string;

  const finalDate = isWalkIn ? new Date().toISOString() : new Date(rawAppointmentDate).toISOString();

  if (!patientId || !finalDate) {
    throw new Error('بيانات غير مكتملة');
  }

  let finalPatientId = patientId;
  let patient;

  if (patientId === 'NEW_PATIENT') {
    const newName = formData.get("new_patient_name") as string;
    const newPhone = formData.get("new_patient_phone") as string;
    
    if (!newName || !newPhone) throw new Error('بيانات المريض الجديد غير مكتملة');

    // Create the patient first
    const { data: newPatientData, error: newPatientError } = await supabase
      .from('patients')
      .insert({ full_name: newName, phone: newPhone })
      .select()
      .single();

    if (newPatientError) {
      console.error(newPatientError);
      throw new Error('حدث خطأ أثناء تسجيل المريض الجديد (قد يكون الرقم مسجل مسبقاً)');
    }

    finalPatientId = newPatientData.id;
    patient = newPatientData;
  } else {
    const { data: existingPatient } = await supabase.from('patients').select('phone, full_name').eq('id', patientId).single();
    patient = existingPatient;
  }
  const { error } = await supabase.from("appointments").insert({
    patient_id: finalPatientId,
    doctor_id: doctorId || null,
    service_id: serviceId || null,
    is_walk_in: isWalkIn,
    appointment_date: finalDate,
    notes: notes || null,
    status: 'Scheduled'
  });

  if (error) {
    console.error("Error creating appointment:", error);
    throw new Error('حدث خطأ أثناء حجز الموعد');
  }

  // Send WhatsApp message via bot
  if (patient && patient.phone) {
    try {
      let message = "";
      if (isWalkIn) {
        message = `أهلاً بك أ. ${patient.full_name} في لومينا ديجيتال 🦷\nلقد تم تسجيل دخولك للعيادة الآن.\nيرجى الانتظار في الاستراحة وسيقوم الطبيب باستقبالك في أقرب فرصة.`;
      } else {
        const timeStr = new Date(finalDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(finalDate).toLocaleDateString('ar-EG');
        message = `تأكيد حجز موعد 📅\nأهلاً أ. ${patient.full_name}،\nتم تأكيد حجز موعدك في لومينا ديجيتال 🦷 يوم ${dateStr} الساعة ${timeStr}.\nنتمنى لك دوام الصحة.`;
      }

      await fetch('http://localhost:4000/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: patient.phone, message })
      });
    } catch (err) {
      console.error("Error sending WhatsApp notification:", err);
    }
  }

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

export async function rescheduleManually(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;
  const newDate = formData.get("new_date") as string;
  
  if (!appointmentId || !newDate) throw new Error('بيانات غير مكتملة');

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({ appointment_date: new Date(newDate).toISOString() })
    .eq('id', appointmentId)
    .select('*, patients(phone, full_name)')
    .single();

  if (error || !appointment) throw new Error('حدث خطأ أثناء التعديل');

  if (appointment.patients?.phone) {
    const timeStr = new Date(newDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date(newDate).toLocaleDateString('ar-EG');
    const message = `نعتذر منك أ. ${appointment.patients.full_name} 🗓️\nنظراً لظروف طارئة، تم تعديل موعدك ليكون يوم ${dateStr} الساعة ${timeStr}.\nنتمنى لك دوام الصحة.`;

    try {
      await fetch('http://localhost:4000/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: appointment.patients.phone, message })
      });
    } catch (err) {
      console.error(err);
    }
  }

  revalidatePath("/dashboard/appointments");
}

export async function askPatientToReschedule(formData: FormData) {
  const supabase = await createClient();
  const appointmentId = formData.get("appointment_id") as string;
  
  if (!appointmentId) return;

  // Get appointment details
  const { data: appt } = await supabase
    .from('appointments')
    .select('*, patients(phone)')
    .eq('id', appointmentId)
    .single();

  if (!appt || !appt.patients?.phone) throw new Error('بيانات المريض غير مكتملة');

  // Cancel old appointment
  await supabase.from('appointments').update({ status: 'Cancelled' }).eq('id', appointmentId);

  // Trigger bot flow
  try {
    await fetch('http://localhost:4000/api/trigger-reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: appt.patients.phone,
        patientId: appt.patient_id,
        doctorId: appt.doctor_id
      })
    });
  } catch (err) {
    console.error(err);
  }

  revalidatePath("/dashboard/appointments");
}
