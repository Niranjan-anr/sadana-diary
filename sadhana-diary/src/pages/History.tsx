import { useEffect, useState } from 'react';
import { getPastLogs } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Calendar, Award, TrendingUp, Sparkles } from 'lucide-react';

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
    <div className="page fade-in">
      <h2 className="page-title">Sadhana History</h2>
      <p className="page-subtitle" style={{ marginBottom: '22px' }}>
        Review your past 7 days of spiritual consistency.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--primary)' }}>
            <Award size={16} /> Total Rounds
          </div>
          <div className="stat-value">{totalRounds}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#1a9d5c' }}>
            <TrendingUp size={16} /> Daily Avg
          </div>
          <div className="stat-value">{averageRounds}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><Calendar size={16} /> Recent Days</div>

        {loading ? (
          <div className="empty-state">Loading history...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Sparkles size={24} color="var(--primary)" /></div>
            No past logs found yet. Start chanting!
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="card-row">
              <div>
                <div className="card-row-title">{log.log_date}</div>
                <div className="card-row-subtitle">
                  Wake: {log.wake_time || 'Not set'} &middot; Sleep: {log.sleep_time || 'Not set'}
                </div>
              </div>
              <div className="pill" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {log.japa_rounds} Rounds
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}