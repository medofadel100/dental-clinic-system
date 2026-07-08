"use client";

import { useEffect, useState } from "react";
import { QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<
    "loading" | "connected" | "disconnected"
  >("loading");
  const [qrCode, setQrCode] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/status");
      const data = await res.json();

      if (data.connected) {
        setStatus("connected");
        setQrCode(null);
      } else {
        setStatus("disconnected");
        setQrCode(data.qrCode);
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp status", err);
      setStatus("disconnected");
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 3 seconds to check for QR updates or connection changes
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setStatus("loading");
      await fetch("http://localhost:4000/api/logout", { method: "POST" });
      setTimeout(fetchStatus, 2000); // Check again after a bit
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1
          style={{
            fontSize: "1.75rem",
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          إعدادات المساعد الذكي (WhatsApp)
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          اربط رقم الواتساب الخاص بالعيادة لتفعيل الرد الآلي وتذكير المواعيد
          للمرضى.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          border: "1px solid var(--border)",
          maxWidth: "600px",
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {status === "loading" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <RefreshCw
              size={48}
              className="animate-spin"
              style={{ color: "var(--primary)" }}
            />
            <p>جاري الاتصال بسيرفر الواتساب...</p>
          </div>
        ) : status === "connected" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
            </div>
            <h2 style={{ color: "var(--success)", fontSize: "1.5rem" }}>
              تم الربط بنجاح!
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              البوت شغال دلوقتي وجاهز يبعت رسايل تأكيد المواعيد للمرضى.
            </p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "var(--error)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              تسجيل الخروج من الحساب
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={32} style={{ color: "var(--error)" }} />
            </div>
            <h2 style={{ fontSize: "1.25rem" }}>الواتساب غير متصل</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              افتح الواتساب من موبايل العيادة ➔ الأجهزة المرتبطة ➔ ربط جهاز ➔
              وامسح الكود التالي:
            </p>

            <div
              style={{
                padding: "1rem",
                backgroundColor: "white",
                borderRadius: "var(--radius-md)",
                border: "2px dashed var(--border)",
                minHeight: "250px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {qrCode ? (
                <Image
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  width={250}
                  height={250}
                />
              ) : (
                <div
                  style={{
                    color: "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <QrCode size={48} />
                  <p>جاري إنشاء كود الربط...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
