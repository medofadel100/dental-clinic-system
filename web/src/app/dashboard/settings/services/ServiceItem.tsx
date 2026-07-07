'use client';

import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { editService } from './actions';

export default function ServiceItem({ service, deleteAction }: { service: any, deleteAction: any }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
      {isEditing ? (
        <form action={async (formData) => {
          await editService(formData);
          setIsEditing(false);
        }} style={{ display: 'flex', gap: '1rem', flex: 1, alignItems: 'center' }}>
          <input type="hidden" name="id" value={service.id} />
          <input type="text" name="name" defaultValue={service.name} required style={{
            padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flex: 2, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
          }} />
          <input type="number" name="base_price" defaultValue={service.base_price} required min="0" step="0.01" style={{
            padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flex: 1, backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
          }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', cursor: 'pointer' }}>
              <Check size={18} />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{service.name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>السعر: {service.base_price} ج.م</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditing(true)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="تعديل">
              <Edit2 size={18} />
            </button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={service.id} />
              <button type="submit" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="حذف">
                <Trash2 size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
