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
    if (userId) {
      await updateJapaRounds(userId, japaRounds + 1);
    }
  };

  const handleDecrement = async () => {
    if (japaRounds > 0) {
      decrementRound();
      if (userId) {
        await updateJapaRounds(userId, japaRounds - 1);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your Japa count for today?')) {
      resetRounds();
      if (userId) {
        await updateJapaRounds(userId, 0);
      }
    }
  };

  return (
    <div style={{ padding: '30px 20px', textAlign: 'center' }}>
      <h2 className="header-title">Japa Offering</h2>
      <p style={{ color: '#6b7280', marginBottom: '40px' }}>
        Track your daily chanting of the Hare Krishna Maha Mantra.
      </p>

      <div style={{
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        border: '8px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 50px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <span style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>
          {japaRounds}
        </span>
        <span style={{ color: '#6b7280', fontSize: '1.1rem', marginTop: '5px' }}>Rounds</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={handleDecrement}
          style={{ padding: '12px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#6b7280' }}
        >
          <Minus size={24} />
        </button>
        
        <button
          onClick={handleIncrement}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '16px 32px', 
            borderRadius: '9999px', 
            border: 'none', 
            background: 'var(--primary)', 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '1.1rem', 
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Plus size={24} />
          Add Round
        </button>

        <button
          onClick={handleReset}
          style={{ padding: '12px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#6b7280' }}
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}