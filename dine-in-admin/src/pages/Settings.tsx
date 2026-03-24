import { useEffect, useState } from 'react';
import { getSettings, updateSetting } from '@/api/adminApi';
import type { RestaurantSetting } from '@/types';

const LABELS: Record<string, { label: string; prefix?: string; suffix?: string }> = {
  tax_rate: { label: 'Tax Rate', suffix: '(e.g. 0.08 = 8%)' },
  delivery_fee: { label: 'Delivery Fee', prefix: '$' },
  service_charge: { label: 'Service Charge', suffix: '(e.g. 0.10 = 10%)' },
  estimated_pickup_minutes: { label: 'Est. Pickup Time', suffix: 'minutes' },
  estimated_delivery_minutes: { label: 'Est. Delivery Time', suffix: 'minutes' },
};

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getSettings().then(setSettings).catch((e) => setError(e.message));
  }, []);

  const startEdit = (s: RestaurantSetting) => {
    setEditingId(s.id);
    setEditValue(s.value);
    setSuccess('');
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateSetting(id, editValue);
      setSettings((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setSuccess('Setting updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    }
    setSaving(false);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings & Surcharges</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400">&times;</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{success}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y">
          {settings.map((s) => {
            const meta = LABELS[s.key] || { label: s.key };
            const isEditing = editingId === s.id;

            return (
              <div key={s.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{meta.label}</p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-1">
                        {meta.prefix && <span className="text-gray-500 text-sm">{meta.prefix}</span>}
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border rounded-lg px-3 py-1.5 text-sm w-32"
                          autoFocus
                        />
                        {meta.suffix && <span className="text-gray-400 text-xs">{meta.suffix}</span>}
                      </div>
                      <button
                        onClick={() => handleSave(s.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-semibold text-gray-800">
                        {meta.prefix}{s.value}{meta.suffix ? ` ${meta.suffix}` : ''}
                      </span>
                      <button
                        onClick={() => startEdit(s)}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {settings.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400">Loading settings...</div>
          )}
        </div>
      </div>
    </div>
  );
}
