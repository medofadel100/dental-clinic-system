'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, DollarSign, Save, Pill, Image as ImageIcon, Send, X } from "lucide-react";
import Odontogram from "@/components/Odontogram";
import { endSession } from "./actions";
import { sendPrescriptionWhatsApp, requestXRayWhatsApp } from "../prescriptions/actions";

export default function ActiveSessionForm({ 
  patient, 
  appointmentId, 
  servicesCatalog, 
  appt 
}: { 
  patient: any; 
  appointmentId: string; 
  servicesCatalog: any[]; 
  appt: any; 
}) {
  const [odontogramData, setOdontogramData] = useState<any>(patient.odontogram_data || {});
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');

  // Modals state
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  
  // Modals loading/success state
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [labLoading, setLabLoading] = useState(false);

  // Auto-calculate cost and update notes when services change
  useEffect(() => {
    const cost = selectedServices.reduce((sum, s) => sum + Number(s.base_price), 0);
    setTotalCost(cost);
    
    if (selectedServices.length > 0) {
      const servicesText = selectedServices.map(s => `- ${s.name} (${s.base_price} ج.م)`).join('\n');
      setTreatmentNotes(`الخدمات المقدمة:\n${servicesText}\n\nملاحظات الطبيب:\n`);
    } else {
      setTreatmentNotes('');
    }
  }, [selectedServices]);

  const toggleService = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPrescriptionLoading(true);
    setPrescriptionSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const result = await sendPrescriptionWhatsApp(formData);
    
    setPrescriptionLoading(false);
    if (result.success) {
      setPrescriptionSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setIsPrescriptionModalOpen(false);
        setPrescriptionSuccess(false);
      }, 2000);
    } else {
      alert(result.error || "حصل مشكلة أثناء الإرسال للواتساب.");
    }
  };

  const handleRequestXRay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLabLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await requestXRayWhatsApp(formData);
    setLabLoading(false);

    if (result.success) {
      alert("تم إرسال طلب الأشعة/المعمل للمريض بنجاح!");
      setIsLabModalOpen(false);
    } else {
      alert(result.error || "فشل إرسال الطلب.");
    }
  };

  return (
    <>
      {/* Action Buttons Top Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button 
          type="button" 
          onClick={() => setIsPrescriptionModalOpen(true)}
          style={{
            padding: "0.5rem 1rem", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}
        >
          📝 كتابة روشتة
        </button>
        <button 
          type="button" 
          onClick={() => setIsLabModalOpen(true)}
          style={{
            padding: "0.5rem 1rem", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}
        >
          🔬 طلب معمل / أشعة
        </button>
      </div>

      <form action={endSession} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <input type="hidden" name="patient_id" value={patient.id} />
        <input type="hidden" name="appointment_id" value={appointmentId} />
        <input type="hidden" name="odontogram_data" value={JSON.stringify(odontogramData)} />

        {/* Odontogram Section */}
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            مخطط الأسنان (تحديد السن المعالج)
          </h2>
          <div style={{ padding: "1rem", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-md)" }}>
            <Odontogram 
              initialData={odontogramData} 
              onChange={setOdontogramData} 
              hideSaveButton={true} 
            />
          </div>
        </div>

        {/* Clinical Section */}
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Stethoscope size={24} color="var(--primary)" />
            التفاصيل الطبية وقائمة الخدمات (Clinical & Services)
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>الخدمات المتاحة (اختر لجمع السعر تلقائياً)</label>
              <div style={{ 
                display: "flex", flexWrap: "wrap", gap: "0.75rem", 
                padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" 
              }}>
                {servicesCatalog.map(service => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-main)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: "pointer",
                        fontWeight: isSelected ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.2s"
                      }}
                    >
                      <span>{service.name}</span>
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>({service.base_price} ج)</span>
                    </button>
                  )
                })}
                {servicesCatalog.length === 0 && (
                  <span style={{ color: "var(--text-secondary)" }}>لم يتم إضافة خدمات في الإعدادات بعد.</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>العمل الذي تم اليوم (Treatments Done)</label>
              <textarea 
                name="treatment_notes" required rows={4} 
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="مثال: تم عمل حشو عصب للضرس رقم 46 وتجهيز مقاس التلبيسة..."
                style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontFamily: "inherit" }}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>خطة الزيارة القادمة (Next Visit Plan)</label>
              <textarea 
                name="next_visit_notes" rows={2} 
                placeholder="مثال: تركيب التلبيسة وحشو الضرس المجاور..."
                style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <DollarSign size={24} color="var(--success)" />
            الحساب المالي (Financials)
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>إجمالي تكلفة العمل (Total Cost)</label>
              <input 
                type="number" name="total_cost" required min="0" step="10"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "rgba(16, 185, 129, 0.05)", fontWeight: "bold", fontSize: "1.1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>عدد الجلسات لتسديد المبلغ (Sessions/Installments)</label>
              <input 
                type="number" name="total_sessions" required defaultValue="1" min="1" max="10"
                style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>نوع الخصم (Discount Type)</label>
              <select name="discount_type" style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <option value="Fixed">مبلغ ثابت (Fixed)</option>
                <option value="Percentage">نسبة مئوية (%)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600 }}>قيمة الخصم (Discount Value)</label>
              <input 
                type="number" name="discount_value" defaultValue="0" min="0" step="10"
                style={{ padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", backgroundColor: "rgba(59, 130, 246, 0.05)", padding: "1.5rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <input type="checkbox" name="deduct_checkup_fee" value="true" id="deduct_fee" style={{ width: "20px", height: "20px" }} />
              <div>
                <label htmlFor="deduct_fee" style={{ fontWeight: 600, fontSize: "1.1rem", cursor: "pointer" }}>
                  خصم ثمن الكشف من تكلفة الشغل؟
                </label>
                <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  الاستقبال أكد أن الكشف: {appt?.checkup_fee_paid ? 'مدفوع' : 'غير مدفوع'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" style={{ 
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          padding: "1.5rem", backgroundColor: "var(--primary)", color: "white",
          border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "1.25rem", fontWeight: 600
        }}>
          <Save size={24} />
          حفظ وإنهاء الجلسة 
        </button>
      </form>

      {/* Prescription Modal */}
      {isPrescriptionModalOpen && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, 
          display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          <div style={{ 
            backgroundColor: "var(--bg-main)", padding: "2rem", borderRadius: "var(--radius-lg)", 
            width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                <Pill size={24} color="var(--primary)" />
                كتابة روشتة جديدة
              </h3>
              <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={24} />
              </button>
            </div>
            
            {prescriptionSuccess && (
              <div style={{ padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", border: "1px solid var(--success)" }}>
                تم إرسال الروشتة للمريض بنجاح!
              </div>
            )}

            <form onSubmit={handlePrescriptionSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <input type="hidden" name="patientId" value={patient.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>الأدوية والجرعات</label>
                <textarea 
                  name="medications" required rows={4}
                  placeholder="مثال:&#10;1. Augmentin 1gm - قرص كل 12 ساعة بعد الأكل"
                  style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>ملاحظات</label>
                <textarea 
                  name="notes" rows={2}
                  style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", fontFamily: "inherit" }}
                />
              </div>
              <button type="submit" disabled={prescriptionLoading} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
                backgroundColor: "var(--primary)", color: "white", border: "none", padding: "0.875rem", 
                borderRadius: "var(--radius-md)", cursor: prescriptionLoading ? "not-allowed" : "pointer", fontWeight: 600, opacity: prescriptionLoading ? 0.7 : 1
              }}>
                <Send size={20} />
                <span>{prescriptionLoading ? "جاري الإرسال..." : "إرسال الروشتة للواتساب"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lab Order Modal */}
      {isLabModalOpen && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, 
          display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          <div style={{ 
            backgroundColor: "var(--bg-main)", padding: "2rem", borderRadius: "var(--radius-lg)", 
            width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                <ImageIcon size={24} color="var(--primary)" />
                طلب أشعة / معمل
              </h3>
              <button type="button" onClick={() => setIsLabModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRequestXRay} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <input type="hidden" name="patientId" value={patient.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>نوع الأشعة أو المعمل المطلوب</label>
                <input 
                  type="text" name="xrayType" required 
                  placeholder="مثال: أشعة بانوراما - Panorama X-Ray"
                  style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", fontFamily: "inherit" }}
                />
              </div>
              <button type="submit" disabled={labLoading} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
                backgroundColor: "var(--primary)", color: "white", border: "none", padding: "0.875rem", 
                borderRadius: "var(--radius-md)", cursor: labLoading ? "not-allowed" : "pointer", fontWeight: 600, opacity: labLoading ? 0.7 : 1
              }}>
                <Send size={20} />
                <span>{labLoading ? "جاري الإرسال..." : "إرسال الطلب للمريض واتساب"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
