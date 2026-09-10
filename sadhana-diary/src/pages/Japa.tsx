import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { getTodayLog, updateJapaRounds } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function Japa() {
  const { japaRounds, setJapaRounds, incrementRound, decrementRound, resetRounds } = useSadhanaStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        getTodayLog(user.id).then((log) => {
          if (log) setJapaRounds(log.japa_rounds);
        });
      }
    });
  }, [setJapaRounds]);

  const handleIncrement = async () => {
    incrementRound();
    if (userId) await updateJapaRounds(userId, japaRounds + 1);
  };

  const handleDecrement = async () => {
    if (japaRounds > 0) {
      decrementRound();
      if (userId) await updateJapaRounds(userId, japaRounds - 1);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your Japa count for today?')) {
      resetRounds();
      if (userId) await updateJapaRounds(userId, 0);
    }
  };

  const progressPct = Math.min(100, (japaRounds / 16) * 100);
  const circumference = 2 * Math.PI * 100;
  const dashOffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="page fade-in" style={{ textAlign: 'center' }}>
      <h2 className="page-title">Japa Offering</h2>
      <p className="page-subtitle" style={{ marginBottom: '40px' }}>
        Track your daily chanting of the Hare Krishna Maha Mantra.
      </p>

      <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto 44px' }}>
        <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="120" cy="120" r="100" fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="120" cy="120" r="100" fill="none"
            stroke="var(--primary)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '4.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {japaRounds}
          </span>
          <span className="text-muted" style={{ fontSize: '1rem', marginTop: '4px', fontWeight: 600 }}>of 16 Rounds</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px' }}>
        <button onClick={handleDecrement} className="btn btn-outline btn-round">
          <Minus size={22} />
        </button>

        <button onClick={handleIncrement} className="btn btn-primary" style={{ padding: '18px 36px', borderRadius: '999px', fontSize: '1.1rem' }}>
          <Plus size={22} />
          Add Round
        </button>

        <button onClick={handleReset} className="btn btn-outline btn-round">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}