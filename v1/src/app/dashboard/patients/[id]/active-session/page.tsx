import { createClient } from "@/utils/supabase/server";
import { Stethoscope, DollarSign, Save, FileText, Activity } from "lucide-react";
import { endSession } from "./actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActiveSessionForm from "./ActiveSessionForm";

export default async function ActiveSessionPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ appointment_id?: string }> }) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;
  
  const resolvedSearchParams = await searchParams;
  const appointmentId = resolvedSearchParams.appointment_id;

  if (!appointmentId) {
    redirect(`/dashboard/patients/${patientId}`);
  }

  const supabase = await createClient();

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  const { data: appt } = await supabase
    .from('appointments')
    .select('checkup_fee_paid')
    .eq('id', appointmentId)
    .single();

  const { data: servicesCatalog } = await supabase
    .from('services_catalog')
    .select('*')
    .order('name');

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity size={28} color="var(--primary)" />
            الجلسة النشطة: {patient?.full_name}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            إدارة التفاصيل الطبية والمالية لجلسة اليوم.
          </p>
        </div>
      </div>

      <ActiveSessionForm 
        patient={patient} 
        appointmentId={appointmentId} 
        servicesCatalog={servicesCatalog || []} 
        appt={appt} 
      />
    </div>
  );
}
