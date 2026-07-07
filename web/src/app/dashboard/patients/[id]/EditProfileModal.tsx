'use client';

import { useState } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { updatePatientProfile } from './actions';

export default function EditProfileModal({ patient }: { patient: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: 'transparent', color: 'var(--primary)',
          border: '1px solid var(--primary)', padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.875rem'
        }}
      >
        <Edit2 size={16} />
        تعديل بيانات المريض
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updatePatientProfile(formData);
      setIsOpen(false);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البيانات.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', padding: '2rem',
        borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px',
        position: 'relative'
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>تعديل بيانات المريض</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="patient_id" value={patient.id} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>اسم المريض بالكامل</label>
            <input type="text" name="full_name" defaultValue={patient.full_name} required style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>رقم الهاتف</label>
            <input type="text" name="phone" defaultValue={patient.phone} required style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>تاريخ الميلاد</label>
            <input type="date" name="date_of_birth" defaultValue={patient.date_of_birth} style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>التاريخ المرضي والملاحظات</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>اكتب كل نقطة في سطر منفصل (مثال: حساسية بنسيلين، مريض سكر)</p>
            <textarea name="medical_history" defaultValue={patient.medical_history || ''} rows={4} placeholder="مثال:&#10;مريض سكر (منتظم)&#10;حساسية من البنسيلين&#10;أجرى عملية بالقلب 2020" style={{
              padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)'
            }} />
          </div>

          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem',
            border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, marginTop: '1rem',
            opacity: loading ? 0.7 : 1
          }}>
            <Save size={18} />
            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </div>
  );
}
