import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { getTodayLog, getTodayStudyTotals, updateField, getUserProfile } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Sun, Moon, CircleDashed, BookOpen, Headphones, Share2 } from 'lucide-react';

export default function Dashboard() {
  const { fullName, setFullName, setTheme, japaRounds, setJapaRounds, wakeTime, sleepTime, setWakeTime, setSleepTime } = useSadhanaStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [totalReadingSecs, setTotalReadingSecs] = useState(0);
  const [totalHearingSecs, setTotalHearingSecs] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);

        const profile = await getUserProfile(user.id);
        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.theme) setTheme(profile.theme);
        }

        const log = await getTodayLog(user.id);
        if (log) {
          setJapaRounds(log.japa_rounds || 0);
          if (log.wake_time) setWakeTime(log.wake_time);
          if (log.sleep_time) setSleepTime(log.sleep_time);
        }

        const totals = await getTodayStudyTotals(user.id);
        setTotalReadingSecs(totals.reading);
        setTotalHearingSecs(totals.hearing);
      }
    });
  }, [setJapaRounds, setWakeTime, setSleepTime, setFullName, setTheme]);

  const handleWakeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWakeTime(val);
    if (userId) await updateField(userId, 'wake_time', val);
  };

  const handleSleepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSleepTime(val);
    if (userId) await updateField(userId, 'sleep_time', val);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handleShareReport = () => {
    const todayStr = new Date().toLocaleDateString();
    const reportText =
      `Hare Krishna Prabhuji,\n` +
      `Dandavat Pranam.\n\n` +
      `My today's report (${todayStr}):\n\n` +
      `Wake up time: ${wakeTime || 'Not set'}\n` +
      `Sleep time: ${sleepTime || 'Not set'}\n` +
      `Japa rounds: ${japaRounds} / 16\n` +
      `Reading: ${formatTime(totalReadingSecs)}\n` +
      `Hearing: ${formatTime(totalHearingSecs)}\n\n` +
      `Your servant,\n` +
      `${fullName}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      alert('Sadhana report copied to clipboard! You can now paste it directly into WhatsApp.');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`, '_blank');
    }
  };

  const progressPct = Math.min(100, Math.round((japaRounds / 16) * 100));

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Hare Krishna, {fullName}!</h2>
          <p className="page-subtitle">Today's Sadhana Report</p>
        </div>
        <button className="btn" onClick={handleShareReport} style={{ background: '#25D366', color: 'white', padding: '10px 16px', borderRadius: '999px', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}>
          <Share2 size={16} /> Share
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div className="card card-pad">
          <div className="input-label" style={{ color: '#f59e0b', marginBottom: '10px' }}>
            <Sun size={16} /> Wake Up
          </div>
          <input type="time" value={wakeTime} onChange={handleWakeChange} className="input" />
        </div>

        <div className="card card-pad">
          <div className="input-label" style={{ color: '#6366f1', marginBottom: '10px' }}>
            <Moon size={16} /> Sleep
          </div>
          <input type="time" value={sleepTime} onChange={handleSleepChange} className="input" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="card-header">Daily Progress</div>

        <div className="card-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-badge" style={{ background: 'var(--primary-light)' }}>
              <CircleDashed size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Japa Rounds</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{progressPct}% of daily goal</div>
            </div>
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{japaRounds}<span className="text-faint" style={{ fontWeight: 600, fontSize: '0.9rem' }}> / 16</span></span>
        </div>

        <div className="card-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-badge" style={{ background: '#eff6ff' }}>
              <BookOpen size={20} color="#3b82f6" />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Reading</span>
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatTime(totalReadingSecs)}</span>
        </div>

        <div className="card-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-badge" style={{ background: '#f5f3ff' }}>
              <Headphones size={20} color="#8b5cf6" />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Hearing</span>
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{formatTime(totalHearingSecs)}</span>
        </div>
      </div>
    </div>
  );
}