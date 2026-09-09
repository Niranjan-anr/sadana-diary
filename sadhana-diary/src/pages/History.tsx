import { useEffect, useState } from 'react';
import { getPastLogs } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Calendar, Award, TrendingUp } from 'lucide-react';

export default function History() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const pastLogs = await getPastLogs(user.id);
        setLogs(pastLogs);
      }
      setLoading(false);
    });
  }, []);

  const totalRounds = logs.reduce((acc, curr) => acc + (curr.japa_rounds || 0), 0);
  const averageRounds = logs.length > 0 ? Math.round(totalRounds / logs.length) : 0;

  return (
    <div style={{ padding: '30px 20px' }}>
      <h2 className="header-title">Sadhana History</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.9rem' }}>
        Review your past 7 days of spiritual consistency.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--saffron-500)', fontWeight: 'bold', marginBottom: '5px' }}>
            <Award size={18} /> Total Rounds
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalRounds}</div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', marginBottom: '5px' }}>
            <TrendingUp size={18} /> Daily Avg
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{averageRounds}</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#fafafa', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} /> Recent Days
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading history...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No past logs found yet. Start chanting!</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{log.log_date}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>
                  Wake: {log.wake_time || 'Not set'} | Sleep: {log.sleep_time || 'Not set'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--saffron-500)' }}>{log.japa_rounds} Rounds</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}