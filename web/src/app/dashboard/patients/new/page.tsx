'use client'

import styles from "../patients.module.css";
import { addPatient } from "../actions";
import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { useFormState } from 'react-dom';
import { useRef } from "react";

// For React 18+ App Router, we use a simple wrapper or just a transition if we need error states
export default function NewPatientPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/dashboard/patients" className={styles.backBtn}>
            <ArrowRight size={24} />
          </Link>
          <h1 className={styles.pageTitle}>إضافة مريض جديد</h1>
        </div>
      </div>

      <div className={styles.formCard}>
        <form action={async (formData) => { await addPatient(formData) }} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="full_name">الاسم بالكامل</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                className={styles.input}
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone">رقم التليفون (WhatsApp)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className={styles.input}
                dir="ltr"
                placeholder="010XXXXXXXX"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="date_of_birth">تاريخ الميلاد</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="medical_history">التاريخ المرضي (إن وجد)</label>
            <textarea
              id="medical_history"
              name="medical_history"
              rows={4}
              className={styles.textarea}
              placeholder="أمراض مزمنة، حساسية، الخ..."
            ></textarea>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              <Save size={20} />
              <span>حفظ المريض</span>
            </button>
            <Link href="/dashboard/patients" className={styles.secondaryBtn}>
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
