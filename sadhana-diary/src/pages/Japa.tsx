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

      <div className="japa-ring-wrap">
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
        <div className="japa-ring-value">
          <span className="japa-ring-number">{japaRounds}</span>
          <span className="japa-ring-label">of 16 Rounds</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px' }}>
        <button onClick={handleDecrement} className="btn btn-outline btn-round">
          <Minus size={22} />
        </button>

        <button onClick={handleIncrement} className="btn btn-primary btn-pill" style={{ padding: '18px 36px', fontSize: '1.1rem' }}>
          <Plus size={22} /> Add Round
        </button>

        <button onClick={handleReset} className="btn btn-outline btn-round">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}