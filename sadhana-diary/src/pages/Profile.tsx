import { useState, useEffect } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { getUserProfile, updateUserProfile, joinMentorByCode } from '../lib/api';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { User, Palette, Check, Users } from 'lucide-react';

export default function Profile() {
  const { fullName, setFullName, theme, setTheme } = useSadhanaStore();
  const [nameInput, setNameInput] = useState(fullName);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [mentorCodeInput, setMentorCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinedMentorName, setJoinedMentorName] = useState<string | null>(null);

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
          if (profile.theme) setTheme(profile.theme);
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
    if (userId) await updateUserProfile(userId, { theme: themeId });
  };

  const handleJoinMentor = async () => {
    if (!userId || !mentorCodeInput.trim()) return;
    setJoining(true);
    try {
      const mentorName = await joinMentorByCode(userId, mentorCodeInput);
      setJoinedMentorName(mentorName);
      setMentorCodeInput('');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not connect to that mentor.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="page fade-in">
      <h2 className="page-title">Devotee Profile</h2>
      <p className="page-subtitle" style={{ marginBottom: '22px' }}>
        Customize your name and choose your transcendental theme.
      </p>

      <form onSubmit={handleSaveName} className="card card-pad" style={{ marginBottom: '20px' }}>
        <label className="input-label">
          <User size={16} color="var(--primary)" /> Your Name / Spiritual Name
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g., Niranjan Das" className="input" style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
        {saved && <span className="save-confirm"><Check size={14} /> Name saved successfully!</span>}
      </form>

      <div className="card card-pad" style={{ marginBottom: '20px' }}>
        <label className="input-label">
          <Users size={16} color="var(--primary)" /> Connect to a Mentor
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={mentorCodeInput}
            onChange={(e) => setMentorCodeInput(e.target.value)}
            placeholder="Enter mentor code"
            className="input"
            style={{ flex: 1, textTransform: 'uppercase' }}
          />
          <button onClick={handleJoinMentor} className="btn btn-primary" disabled={joining}>
            {joining ? 'Connecting...' : 'Connect'}
          </button>
        </div>
        {joinedMentorName && (
          <p style={{ color: '#1a9d5c', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0, fontWeight: 700 }}>
            Connected to {joinedMentorName}!
          </p>
        )}
      </div>

      <div className="card card-pad">
        <div className="input-label" style={{ marginBottom: '4px' }}>
          <Palette size={16} color="var(--primary)" /> Select Devotional Theme
        </div>
        <p className="text-faint" style={{ fontSize: '0.78rem', marginTop: 0, marginBottom: '14px' }}>
          Each theme changes the accent color and background across the whole app.
        </p>

        <div className="theme-grid">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <div key={t.id} onClick={() => handleSelectTheme(t.id)} className={`theme-tile${active ? ' theme-tile-active' : ''}`} style={{ backgroundImage: `url(${t.bgImage})`, borderColor: active ? t.color : 'transparent' }}>
                <div className="theme-tile-dot" style={{ backgroundColor: t.color }} />
                {active && <div className="theme-tile-check"><Check size={12} color={t.color} /></div>}
                <div className="theme-tile-overlay"><span className="theme-tile-label">{t.name}</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}