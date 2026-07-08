"use server";

import { createClient } from "@/utils/supabase/server";

export async function sendPrescriptionWhatsApp(formData: FormData) {
  try {
    const supabase = await createClient();

    const patientId = formData.get("patientId") as string;
    const medications = formData.get("medications") as string;
    const notes = formData.get("notes") as string;

    if (!patientId) return { error: "معرف المريض مفقود." };

    // 1. Save to DB (Assuming table exists, if it errors out it just skips to WhatsApp)
    await supabase
      .from("prescriptions")
      .insert([{ patient_id: patientId, medications, notes }]);

    // Fetch patient's phone number
    const { data: patient, error: dbError } = await supabase
      .from("patients")
      .select("phone, full_name")
      .eq("id", patientId)
      .single();

    if (dbError || !patient || !patient.phone) {
      return { error: "لم يتم العثور على المريض أو رقم الهاتف." };
    }

    // Construct the WhatsApp Message
    const message = `*روشتة طبية - لومينا ديجيتال* 🦷\nأهلاً بك أ. ${patient.full_name}،\nأتمنى لك دوام الصحة والعافية.\n\n*الأدوية والجرعات:*\n${medications}\n\n${notes ? `*ملاحظات الطبيب:*\n${notes}\n\n` : ""}مع تحيات إدارة العيادة.`;

    // Send to WhatsApp Microservice
    const response = await fetch("http://localhost:4000/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: patient.phone, message: message }),
    });

    const result = await response.json();
    if (!result.success) return { error: result.error };

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function requestXRayWhatsApp(formData: FormData) {
  try {
    const supabase = await createClient();
    const patientId = formData.get("patientId") as string;
    const xrayType = formData.get("xrayType") as string;

    const { data: patient } = await supabase
      .from("patients")
      .select("phone, full_name")
      .eq("id", patientId)
      .single();

    if (!patient || !patient.phone)
      return { error: "لم يتم العثور على رقم المريض." };

    const message = `*تذكير من لومينا ديجيتال* 🦷\nأهلاً بك أ. ${patient.full_name}،\nيرجى عمل أشعة (${xrayType}) وإرسال صورة واضحة منها هنا عبر الواتساب في أقرب وقت ليتمكن الطبيب من مراجعتها.\nشكراً لتعاونك.`;

    const response = await fetch("http://localhost:4000/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: patient.phone, message }),
    });

    const result = await response.json();
    return result.success ? { success: true } : { error: result.error };
  } catch (err) {
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function getPatientPrescriptions(patientId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(err);
    return { error: "فشل في جلب التاريخ المرضي للروشتات." };
  }
}
