import Link from "next/link";
import { MessageSquare, User, Shield, Bell, Package } from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          الإعدادات (Settings)
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          إدارة إعدادات العيادة، الحساب، والربط مع الخدمات الخارجية.
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem"
      }}>
        {/* WhatsApp Settings Card */}
        <Link href="/dashboard/settings/whatsapp" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{
            backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            padding: "1.5rem", border: "1px solid var(--border)", display: "flex",
            alignItems: "flex-start", gap: "1rem", cursor: "pointer", transition: "all 0.2s"
          }} className="settings-card-hover">
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>المساعد الذكي (WhatsApp)</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                ربط الواتساب لإرسال تذكيرات المواعيد والروشتات أوتوماتيكياً.
              </p>
            </div>
          </div>
        </Link>

        {/* Profile Settings Card */}
        <Link href="/dashboard/settings/clinic" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{
            backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            padding: "1.5rem", border: "1px solid var(--border)", display: "flex",
            alignItems: "flex-start", gap: "1rem", cursor: "pointer", transition: "all 0.2s"
          }} className="settings-card-hover">
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>الملف الشخصي للعيادة</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                تعديل اسم العيادة، مواعيد العمل، وبيانات التواصل.
              </p>
            </div>
          </div>
        </Link>

        {/* Doctor Schedules Settings Card */}
        <Link href="/dashboard/settings/schedules" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{
            backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            padding: "1.5rem", border: "1px solid var(--border)", display: "flex",
            alignItems: "flex-start", gap: "1rem", cursor: "pointer", transition: "all 0.2s"
          }} className="settings-card-hover">
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>مواعيد الأطباء</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                إدارة جداول وأيام عمل الأطباء للذكاء الاصطناعي.
              </p>
            </div>
          </div>
        </Link>

        {/* Inventory Settings Card */}
        <Link href="/dashboard/settings/inventory" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{
            backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            padding: "1.5rem", border: "1px solid var(--border)", display: "flex",
            alignItems: "flex-start", gap: "1rem", cursor: "pointer", transition: "all 0.2s"
          }} className="settings-card-hover">
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--warning, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Package size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>إعدادات المخزن (الحدود الدنيا)</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                تعديل الحد الأدنى للتنبيه لكل صنف في المخزن لتجنب النواقص.
              </p>
            </div>
          </div>
        </Link>

        {/* Services Settings Card */}
        <Link href="/dashboard/settings/services" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{
            backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            padding: "1.5rem", border: "1px solid var(--border)", display: "flex",
            alignItems: "flex-start", gap: "1rem", cursor: "pointer", transition: "all 0.2s"
          }} className="settings-card-hover">
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(139, 92, 246, 0.1)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>الخدمات الطبية والتسعير</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                إضافة الخدمات وتعديل الأسعار الأساسية (كشف، خلع، حشو، إلخ).
              </p>
            </div>
          </div>
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .settings-card-hover:hover {
          border-color: var(--primary) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}} />
    </div>
  );
}
