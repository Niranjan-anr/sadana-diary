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
        
        // Fetch Profile Name and Theme
        const profile = await getUserProfile(user.id);
        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.theme) setTheme(profile.theme);
        }
        
        // Fetch Japa & Timetable
        const log = await getTodayLog(user.id);
        if (log) {
          setJapaRounds(log.japa_rounds || 0);
          if (log.wake_time) setWakeTime(log.wake_time);
          if (log.sleep_time) setSleepTime(log.sleep_time);
        }

        // Fetch Study Totals
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
      `🌿 *Sadhana Report - ${todayStr}* 🌿\n` +
      `Hare Krishna Prabhu, please accept my humble obeisances. All glories to Srila Prabhupada.\n\n` +
      `📿 Japa Rounds: ${japaRounds} / 16\n` +
      `🌅 Wake Up: ${wakeTime || 'Not set'}\n` +
      `🌙 Sleep: ${sleepTime || 'Not set'}\n` +
      `📖 Reading: ${formatTime(totalReadingSecs)}\n` +
      `🎧 Hearing: ${formatTime(totalHearingSecs)}\n\n` +
      `Your servant,`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      alert('Sadhana report copied to clipboard! You can now paste it directly into WhatsApp.');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`, '_blank');
    }
  };

  return (
    <div style={{ padding: '30px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h2 className="header-title" style={{ margin: 0 }}>Hare Krishna, {fullName}!</h2>
        <button
          onClick={handleShareReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#25D366',
            color: 'white',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(37, 211, 102, 0.3)'
          }}
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.9rem' }}>
        Today's Sadhana Report
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 'bold' }}>
            <Sun size={18} /> Wake Up
          </div>
          <input 
            type="time" 
            value={wakeTime}
            onChange={handleWakeChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
          />
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 'bold' }}>
            <Moon size={18} /> Sleep
          </div>
          <input 
            type="time" 
            value={sleepTime}
            onChange={handleSleepChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
          />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fafafa', fontWeight: 'bold' }}>
          Daily Progress
        </div>
        
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
            <CircleDashed size={24} color="var(--saffron-500)" />
            <span style={{ fontSize: '1.1rem' }}>Japa Rounds</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{japaRounds} / 16</span>
        </div>

        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
            <BookOpen size={24} color="var(--saffron-500)" />
            <span style={{ fontSize: '1.1rem' }}>Reading</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatTime(totalReadingSecs)}</span>
        </div>

        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
            <Headphones size={24} color="var(--saffron-500)" />
            <span style={{ fontSize: '1.1rem' }}>Hearing</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatTime(totalHearingSecs)}</span>
        </div>
      </div>
    </div>
  );
}