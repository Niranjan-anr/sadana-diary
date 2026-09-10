import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { getTodayLog, getTodayStudyTotals, updateField, getUserProfile, getSadhakaTarget, getTodayReport, submitDailyReport, getLeaderboard, type LeaderboardPeriod } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Sun, Moon, CircleDashed, BookOpen, Headphones, Send, Check, Lock, Trophy, ChevronLeft } from 'lucide-react';

const DEFAULT_TARGET = { min_rounds: 16, min_reading_seconds: 0, min_hearing_seconds: 0 };

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  all_time: 'All Time',
};

type LeaderboardRow = { sadhaka_id: string; full_name: string; completion_pct: number; is_me: boolean };

export default function Dashboard() {
  const { fullName, setFullName, setTheme, japaRounds, setJapaRounds, wakeTime, sleepTime, setWakeTime, setSleepTime } = useSadhanaStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [totalReadingSecs, setTotalReadingSecs] = useState(0);
  const [totalHearingSecs, setTotalHearingSecs] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Manual overrides — let a sadhaka correct today's numbers before submitting
  // (e.g. they forgot to start the reading timer). null means "use the
  // computed/tracked value"; once they type something, that wins.
  const [editJapa, setEditJapa] = useState<number | null>(null);
  const [editReadingMin, setEditReadingMin] = useState<number | null>(null);
  const [editHearingMin, setEditHearingMin] = useState<number | null>(null);

  // Leaderboard view
  const [view, setView] = useState<'main' | 'leaderboard'>('main');
  const [period, setPeriod] = useState<LeaderboardPeriod>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

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
          setWakeTime(log.wake_time || '');
          setSleepTime(log.sleep_time || '');
        }
        const totals = await getTodayStudyTotals(user.id);
        setTotalReadingSecs(totals.reading);
        setTotalHearingSecs(totals.hearing);

        const t = await getSadhakaTarget(user.id);
        setTarget(t ?? DEFAULT_TARGET);

        const existingReport = await getTodayReport(user.id);
        setAlreadySubmitted(!!existingReport);
      }
    });
  }, [setJapaRounds, setWakeTime, setSleepTime, setFullName, setTheme]);

  useEffect(() => {
    if (view !== 'leaderboard') return;
    setLoadingBoard(true);
    getLeaderboard(period)
      .then(setLeaderboard)
      .catch(() => alert('Could not load the leaderboard — please try again.'))
      .finally(() => setLoadingBoard(false));
  }, [view, period]);

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

  // Resolved values — manual edit wins if the person has touched that field,
  // otherwise fall back to the tracked/computed value.
  const effectiveJapa = editJapa ?? japaRounds;
  const effectiveReadingSecs = editReadingMin !== null ? editReadingMin * 60 : totalReadingSecs;
  const effectiveHearingSecs = editHearingMin !== null ? editHearingMin * 60 : totalHearingSecs;

  const handleConfirmSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await submitDailyReport(userId, {
        wake_time: wakeTime || null,
        sleep_time: sleepTime || null,
        japa_rounds: effectiveJapa,
        reading_seconds: effectiveReadingSecs,
        hearing_seconds: effectiveHearingSecs,
        target_rounds: target.min_rounds,
        target_reading_seconds: target.min_reading_seconds,
        target_hearing_seconds: target.min_hearing_seconds,
        submitted_by: 'manual',
      });
      setAlreadySubmitted(true);
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    } catch (err) {
      alert('Could not send your report — please check your connection and try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const roundsPct = target.min_rounds > 0 ? Math.round((effectiveJapa / target.min_rounds) * 100) : 0;

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Hare Krishna, {fullName}!</h2>
          <p className="page-subtitle">{view === 'leaderboard' ? 'Leaderboard' : "Today's Sadhana Report"}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {view === 'main' && (
            <button className="btn btn-outline btn-round" onClick={() => setView('leaderboard')} aria-label="Leaderboard">
              <Trophy size={18} color="var(--primary)" />
            </button>
          )}
          {view === 'main' && (
            alreadySubmitted ? (
              <button className="btn btn-outline btn-pill" disabled style={{ opacity: 0.7, cursor: 'default' }}>
                <Lock size={16} /> Report Sent
              </button>
            ) : (
              <button className="btn btn-share" onClick={() => setShowConfirmModal(true)}>
                <Send size={16} /> Submit
              </button>
            )
          )}
        </div>
      </div>

      {view === 'leaderboard' ? (
        <div className="fade-in">
          <button
            onClick={() => setView('main')}
            className="btn btn-outline"
            style={{ marginBottom: '16px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="mode-toggle">
            {(['daily', 'weekly', 'all_time'] as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                className={`mode-toggle-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="card">
            {loadingBoard ? (
              <div className="empty-state">Loading...</div>
            ) : leaderboard.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Trophy size={24} color="var(--primary)" /></div>
                No reports for this period yet.
              </div>
            ) : (
              leaderboard.map((row, i) => (
                <div
                  key={row.sadhaka_id}
                  className="card-row"
                  style={row.is_me ? { background: 'var(--primary-light)' } : undefined}
                >
                  <div className="card-row-left">
                    <div className="icon-badge amber" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      #{i + 1}
                    </div>
                    <div className="card-row-title">
                      {row.full_name}{row.is_me ? ' (You)' : ''}
                    </div>
                  </div>
                  <span className="card-row-value">{Math.round(row.completion_pct * 100)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {justSubmitted && (
            <div className="success-banner"><Check size={18} /> Report sent to your mentor!</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div className="card card-pad">
              <div className="input-label" style={{ color: '#c2790a' }}>
                <Sun size={16} /> Wake Up
              </div>
              <input type="time" value={wakeTime} onChange={handleWakeChange} className="input" disabled={alreadySubmitted} />
            </div>
            <div className="card card-pad">
              <div className="input-label" style={{ color: '#6b21a8' }}>
                <Moon size={16} /> Sleep
              </div>
              <input type="time" value={sleepTime} onChange={handleSleepChange} className="input" disabled={alreadySubmitted} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-header">Daily Progress</div>

            <div className="card-row">
              <div className="card-row-left">
                <div className="icon-badge amber"><CircleDashed size={20} color="var(--primary)" /></div>
                <div>
                  <div className="card-row-title">Japa Rounds</div>
                  <div className="card-row-subtitle">{roundsPct}% of your target</div>
                </div>
              </div>
              {alreadySubmitted ? (
                <span className="card-row-value">
                  {effectiveJapa}
                  <span className="text-faint" style={{ fontWeight: 600, fontSize: '0.9rem' }}> / {target.min_rounds}</span>
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  className="input"
                  style={{ width: '70px', textAlign: 'right', padding: '8px' }}
                  value={effectiveJapa}
                  onChange={(e) => setEditJapa(Math.max(0, parseInt(e.target.value) || 0))}
                />
              )}
            </div>

            <div className="card-row">
              <div className="card-row-left">
                <div className="icon-badge blue"><BookOpen size={20} color="#3b82f6" /></div>
                <span className="card-row-title">Reading</span>
              </div>
              {alreadySubmitted ? (
                <span className="card-row-value">{formatTime(effectiveReadingSecs)}</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    style={{ width: '70px', textAlign: 'right', padding: '8px' }}
                    value={Math.round(effectiveReadingSecs / 60)}
                    onChange={(e) => setEditReadingMin(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="text-faint" style={{ fontSize: '0.8rem' }}>min</span>
                </div>
              )}
            </div>

            <div className="card-row">
              <div className="card-row-left">
                <div className="icon-badge violet"><Headphones size={20} color="#8b5cf6" /></div>
                <span className="card-row-title">Hearing</span>
              </div>
              {alreadySubmitted ? (
                <span className="card-row-value">{formatTime(effectiveHearingSecs)}</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    style={{ width: '70px', textAlign: 'right', padding: '8px' }}
                    value={Math.round(effectiveHearingSecs / 60)}
                    onChange={(e) => setEditHearingMin(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="text-faint" style={{ fontSize: '0.8rem' }}>min</span>
                </div>
              )}
            </div>
          </div>

          {!alreadySubmitted && (
            <p className="text-faint" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              Haven't submitted by midnight? Your report sends automatically with today's numbers as they stand.
            </p>
          )}

          {showConfirmModal && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h3 className="modal-title">Send Today's Report?</h3>
                <p className="modal-text">
                  This locks in {effectiveJapa} rounds, {formatTime(effectiveReadingSecs)} reading, and {formatTime(effectiveHearingSecs)} hearing for today. You won't be able to edit after sending.
                </p>
                <div className="modal-actions">
                  <button onClick={() => setShowConfirmModal(false)} className="btn btn-outline" disabled={submitting}>Cancel</button>
                  <button onClick={handleConfirmSubmit} className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Confirm & Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}