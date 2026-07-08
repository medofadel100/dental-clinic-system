import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "../../financials/financials.module.css";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { addService, deleteService } from "./actions";
import ServiceItem from "./ServiceItem";

export default async function ServicesSettingsPage() {
  const supabase = await createClient();

  // Check if Admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "Admin") {
    return redirect("/dashboard");
  }

  // Fetch services
  const { data: services } = await supabase
    .from("services_catalog")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "0.5rem",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            <ArrowRight size={20} />
          </Link>
          <h1 className={styles.pageTitle}>الخدمات والأسعار</h1>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}
      >
        {/* Form to add new service */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            height: "fit-content",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            إضافة خدمة طبية جديدة
          </h2>
          <form
            action={addService}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                اسم الخدمة (مثل: كشف، حشو عصب)
              </label>
              <input
                type="text"
                name="name"
                required
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                السعر الأساسي (ج.م)
              </label>
              <input
                type="number"
                name="base_price"
                required
                min="0"
                step="0.01"
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: "1rem",
              }}
            >
              <Plus size={20} />
              إضافة الخدمة
            </button>
          </form>
        </div>

        {/* List of services */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            قائمة الخدمات المتاحة
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {services?.length === 0 ? (
              <p
                style={{
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "2rem 0",
                }}
              >
                لا يوجد خدمات مسجلة حالياً.
              </p>
            ) : (
              services?.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  deleteAction={deleteService}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
