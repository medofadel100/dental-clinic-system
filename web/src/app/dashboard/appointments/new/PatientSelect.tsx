"use client";

import { useState, useRef, useEffect } from "react";

type Patient = { id: string; full_name: string; phone?: string };

export default function PatientSelect({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter patients by name or phone
  const filteredPatients = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
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
        المريض
      </label>

      {/* Hidden input to submit the actual patient ID in the form */}
      <input
        type="hidden"
        name="patient_id"
        value={selectedPatient?.id || ""}
        required
      />

      <input
        type="text"
        placeholder="ابحث بالاسم أو رقم الهاتف..."
        value={
          isOpen
            ? search
            : selectedPatient
              ? `${selectedPatient.full_name} (${selectedPatient.phone})`
              : ""
        }
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          setSelectedPatient(null);
        }}
        onFocus={() => setIsOpen(true)}
        style={{
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-main)",
          color: "var(--text-primary)",
          width: "100%",
        }}
      />

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            zIndex: 10,
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            maxHeight: "200px",
            overflowY: "auto",
            listStyle: "none",
            padding: 0,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {filteredPatients.length > 0
            ? filteredPatients.map((p) => (
                <li
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{ fontWeight: 500, color: "var(--text-primary)" }}
                  >
                    {p.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {p.phone}
                  </div>
                </li>
              ))
            : null}

          <li
            onClick={() => {
              setSelectedPatient({
                id: "NEW_PATIENT",
                full_name: "مريض جديد غير مسجل",
              });
              setSearch("");
              setIsOpen(false);
            }}
            style={{
              padding: "0.75rem 1rem",
              cursor: "pointer",
              color: "var(--primary)",
              fontWeight: 600,
              textAlign: "center",
              backgroundColor: "rgba(14, 165, 233, 0.05)",
            }}
          >
            + إضافة مريض جديد
          </li>
        </ul>
      )}

      {selectedPatient?.id === "NEW_PATIENT" && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            name="new_patient_name"
            placeholder="اسم المريض بالكامل"
            required
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-primary)",
              flex: 1,
            }}
          />
          <input
            type="text"
            name="new_patient_phone"
            placeholder="رقم الهاتف (مثال: 010...)"
            required
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-primary)",
              flex: 1,
            }}
          />
        </div>
      )}
    </div>
  );
}
