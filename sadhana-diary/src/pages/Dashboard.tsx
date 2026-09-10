import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import {
  getTodayLog,
  getTodayStudyTotals,
  updateField,
  getUserProfile,
  getSadhakaTarget,
  getTodayReport,
  submitDailyReport,
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { Sun, Moon, CircleDashed, BookOpen, Headphones, Send, Check, Lock } from 'lucide-react';

const DEFAULT_TARGET = { min_rounds: 16, min_reading_seconds: 0, min_hearing_seconds: 0 };

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

  const handleConfirmSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await submitDailyReport(userId, {
        wake_time: wakeTime || null,
        sleep_time: sleepTime || null,
        japa_rounds: japaRounds,
        reading_seconds: totalReadingSecs,
        hearing_seconds: totalHearingSecs,
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

  const roundsPct = target.min_rounds > 0 ? Math.round((japaRounds / target.min_rounds) * 100) : 0;

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Hare Krishna, {fullName}!</h2>
          <p className="page-subtitle">Today's Sadhana Report</p>
        </div>

        {alreadySubmitted ? (
          <button className="btn btn-outline btn-pill" disabled style={{ opacity: 0.7, cursor: 'default' }}>
            <Lock size={16} /> Report Sent
          </button>
        ) : (
          <button className="btn btn-share" onClick={() => setShowConfirmModal(true)}>
            <Send size={16} /> Submit
          </button>
        )}
      </div>

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
          <span className="card-row-value">{japaRounds}<span className="text-faint" style={{ fontWeight: 600, fontSize: '0.9rem' }}> / {target.min_rounds}</span></span>
        </div>

        <div className="card-row">
          <div className="card-row-left">
            <div className="icon-badge blue"><BookOpen size={20} color="#3b82f6" /></div>
            <span className="card-row-title">Reading</span>
          </div>
          <span className="card-row-value">{formatTime(totalReadingSecs)}</span>
        </div>

        <div className="card-row">
          <div className="card-row-left">
            <div className="icon-badge violet"><Headphones size={20} color="#8b5cf6" /></div>
            <span className="card-row-title">Hearing</span>
          </div>
          <span className="card-row-value">{formatTime(totalHearingSecs)}</span>
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
              This locks in {japaRounds} rounds, {formatTime(totalReadingSecs)} reading, and {formatTime(totalHearingSecs)} hearing for today. You won't be able to edit after sending.
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
    </div>
  );
}