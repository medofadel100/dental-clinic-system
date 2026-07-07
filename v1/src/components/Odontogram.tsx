'use client';

import { useState } from 'react';
import styles from './odontogram.module.css';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CONDITIONS = [
  { id: 'normal', label: 'سليم (Normal)', color: '#e2e8f0' },
  { id: 'cavity', label: 'تسوس (Cavity)', color: '#ef4444' },
  { id: 'extracted', label: 'مخلوع (Extracted)', color: '#94a3b8' },
  { id: 'root_canal', label: 'عصب (Root Canal)', color: '#8b5cf6' },
  { id: 'crown', label: 'طربوش (Crown)', color: '#f59e0b' },
  { id: 'implant', label: 'زراعة (Implant)', color: '#0ea5e9' },
];

export default function Odontogram({ 
  initialData = {}, 
  onSave,
  onChange,
  hideSaveButton = false
}: { 
  initialData?: any; 
  onSave?: (data: any) => void;
  onChange?: (data: any) => void;
  hideSaveButton?: boolean;
}) {
  const [data, setData] = useState<Record<number, string>>(initialData);
  const [selectedCondition, setSelectedCondition] = useState<string>('cavity');
  const [isSaving, setIsSaving] = useState(false);

  const handleToothClick = (tooth: number) => {
    const newData = {
      ...data,
      [tooth]: selectedCondition,
    };
    setData(newData);
    if (onChange) onChange(newData);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    await onSave(data);
    setIsSaving(false);
  };

  const getToothColor = (tooth: number) => {
    const conditionId = data[tooth] || 'normal';
    return CONDITIONS.find(c => c.id === conditionId)?.color || '#e2e8f0';
  };

  const renderToothRow = (teeth: number[]) => (
    <div className={styles.toothRow}>
      {teeth.map(tooth => (
        <div 
          key={tooth} 
          className={styles.tooth}
          onClick={() => handleToothClick(tooth)}
          title={`سِنة ${tooth}`}
        >
          <div 
            className={styles.toothIcon} 
            style={{ backgroundColor: getToothColor(tooth) }}
          >
            {data[tooth] === 'extracted' && <div className={styles.crossLine}></div>}
          </div>
          <span className={styles.toothNumber}>{tooth}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.odontogramContainer}>
      <div className={styles.toolbar}>
        <h3>الحالات (Conditions)</h3>
        <div className={styles.conditionsList}>
          {CONDITIONS.map(cond => (
            <button
              key={cond.id}
              className={`${styles.conditionBtn} ${selectedCondition === cond.id ? styles.active : ''}`}
              onClick={() => setSelectedCondition(cond.id)}
            >
              <div className={styles.colorBox} style={{ backgroundColor: cond.color }}></div>
              <span>{cond.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.arch}>
          {/* Upper Jaw */}
          <div className={styles.jaw}>
            {renderToothRow(UPPER_RIGHT)}
            {renderToothRow(UPPER_LEFT)}
          </div>
          
          <div className={styles.divider}>العلوي (Upper) | السفلي (Lower)</div>

          {/* Lower Jaw */}
          <div className={styles.jaw}>
            {renderToothRow(LOWER_RIGHT)}
            {renderToothRow(LOWER_LEFT)}
          </div>
        </div>
      </div>

      {!hideSaveButton && (
        <div className={styles.actions}>
          <button 
            className={styles.saveBtn} 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ المخطط'}
          </button>
        </div>
      )}
    </div>
  );
}
