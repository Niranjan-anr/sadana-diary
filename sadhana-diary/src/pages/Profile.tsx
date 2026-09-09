import { useState, useEffect } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { getUserProfile, updateUserProfile } from '../lib/api';
import { supabase } from '../lib/supabase';
import { User, Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'default', name: 'Default Saffron', color: '#f97316' },
  { id: 'krishna', name: 'Sri Krishna (Peacock Blue)', color: '#1d4ed8' },
  { id: 'radharani', name: 'Srimati Radharani', color: '#db2777' },
  { id: 'balaram', name: 'Lord Balarama', color: '#15803d' },
  { id: 'gaura', name: 'Sri Chaitanya Mahaprabhu', color: '#ca8a04' },
  { id: 'nityananda', name: 'Lord Nityananda', color: '#0284c7' },
  { id: 'prabhupada', name: 'Srila Prabhupada', color: '#9a3412' },
  { id: 'panchatatva', name: 'Pancha-tattva', color: '#7c3aed' },
];

export default function Profile() {
  const { fullName, setFullName, theme, setTheme } = useSadhanaStore();
  const [nameInput, setNameInput] = useState(fullName);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const profile = await getUserProfile(user.id);
        if (profile) {
          if (profile.full_name) {
            setFullName(profile.full_name);
            setNameInput(profile.full_name);
          }
          if (profile.theme) {
            setTheme(profile.theme);
          }
        }
      }
    });
  }, [setFullName, setTheme]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setFullName(nameInput);
    if (userId) {
      await updateUserProfile(userId, { full_name: nameInput });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSelectTheme = async (themeId: string) => {
    setTheme(themeId);
    if (userId) {
      await updateUserProfile(userId, { theme: themeId });
    }
  };

  return (
    <div style={{ padding: '30px 20px' }}>
      <h2 className="header-title">Devotee Profile</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.9rem' }}>
        Customize your name and choose your transcendental theme.
      </p>

      {/* Name Form */}
      <form onSubmit={handleSaveName} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '25px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
          <User size={18} color="var(--primary)" /> Your Name / Spiritual Name
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g., Niranjan Das"
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <button 
            type="submit"
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
        {saved && <span style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}>Name saved successfully!</span>}
      </form>

      {/* Theme Selection */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '15px' }}>
          <Palette size={18} color="var(--primary)" /> Select Devotional Theme
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {THEMES.map((t) => (
            <div 
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 15px',
                borderRadius: '8px',
                border: theme === t.id ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                background: theme === t.id ? 'var(--bg-main)' : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: t.color }}></div>
                <span style={{ fontWeight: theme === t.id ? 'bold' : 'normal', color: 'var(--text-main)' }}>{t.name}</span>
              </div>
              {theme === t.id && <Check size={18} color="var(--primary)" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}