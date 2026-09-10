import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  getMentorSadhakas, updateSadhakaTarget, getMyMentorCode, generateMentorCode,
} from '../../lib/api';
import { BHAKTI_STEPS, getBhaktiStep } from '../../lib/bhaktiSteps';
import {
  Users, AlertCircle, CheckCircle2, Settings, X, Trophy,
  ChevronLeft, HelpCircle, Copy, RefreshCw,
} from 'lucide-react';

type SadhakaRow = {
  sadhaka_id: string;
  full_name: string;
  has_report_today: boolean;
  japa_rounds: number;
  target_rounds: number;
  reading_seconds: number;
  target_reading_seconds: number;
  hearing_seconds: number;
  target_hearing_seconds: number;
  completion_pct: number | null;
  bhakti_step: string | null;
  reading_material: string | null;
  hearing_material: string | null;
};

type FilterView = 'all' | 'below' | 'not_reported' | 'completed';

const VIEW_META: Record<FilterView, { title: string; empty: string }> = {
  all: { title: 'All Sadhakas', empty: 'No sadhakas assigned to you yet.' },
  below: { title: 'Below Target', empty: 'Nobody is currently below target — great!' },
  not_reported: { title: 'Not Reported Yet', empty: 'Everyone has reported today.' },
  completed: { title: 'Completed — Leaderboard', empty: 'No one has completed their target yet today.' },
};

export default function MentorDashboard() {
  const [sadhakas, setSadhakas] = useState<SadhakaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<FilterView | null>(null);

  const [mentorCode, setMentorCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRounds, setEditRounds] = useState('16');
  const [editReading, setEditReading] = useState('0');
  const [editHearing, setEditHearing] = useState('0');
  const [useStepMode, setUseStepMode] = useState(false);
  const [editBhaktiStep, setEditBhaktiStep] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSadhakas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rows = await getMentorSadhakas(user.id);
    setSadhakas(rows);
    const code = await getMyMentorCode(user.id);
    setMentorCode(code);
    setLoading(false);
  };

  useEffect(() => {
    loadSadhakas();
  }, []);

  const handleGenerateCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setGeneratingCode(true);
    try {
      const code = await generateMentorCode(user.id);
      setMentorCode(code);
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (mentorCode) {
      navigator.clipboard.writeText(mentorCode);
      alert('Mentor code copied! Share it with your sadhaka.');
    }
  };

  const openEdit = (s: SadhakaRow) => {
    setEditingId(s.sadhaka_id);
    setEditRounds(String(s.target_rounds ?? 16));
    setEditReading(String(Math.round((s.target_reading_seconds ?? 0) / 60)));
    setEditHearing(String(Math.round((s.target_hearing_seconds ?? 0) / 60)));
    setUseStepMode(!!s.bhakti_step);
    setEditBhaktiStep(s.bhakti_step ?? '');
  };

  const handleSelectStep = (stepId: string) => {
    setEditBhaktiStep(stepId);
    const step = getBhaktiStep(stepId);
    if (step) setEditRounds(String(step.minRounds));
  };

  const saveTarget = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateSadhakaTarget(editingId, {
        min_rounds: parseInt(editRounds) || 0,
        min_reading_seconds: (parseInt(editReading) || 0) * 60,
        min_hearing_seconds: (parseInt(editHearing) || 0) * 60,
        bhakti_step: useStepMode ? (editBhaktiStep || null) : null,
      });
      setEditingId(null);
      await loadSadhakas();
    } catch (e) {
      alert('Could not save target — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const belowTarget = sadhakas.filter(s => s.has_report_today && (s.completion_pct ?? 0) < 1);
  const notReported = sadhakas.filter(s => !s.has_report_today);
  const completed = sadhakas
    .filter(s => s.has_report_today && (s.completion_pct ?? 0) >= 1)
    .sort((a, b) => (b.completion_pct ?? 0) - (a.completion_pct ?? 0));

  const listFor = (v: FilterView): SadhakaRow[] => {
    if (v === 'all') return sadhakas;
    if (v === 'below') return belowTarget;
    if (v === 'not_reported') return notReported;
    return completed;
  };

  const renderRow = (s: SadhakaRow, i: number) => {
    const pct = s.has_report_today ? Math.round((s.completion_pct ?? 0) * 100) : null;
    const met = pct !== null && pct >= 100;
    const stepDef = getBhaktiStep(s.bhakti_step);
    return (
      <div key={s.sadhaka_id} className="card-row">
        <div className="card-row-left">
          {view === 'completed' ? (
            <div className="icon-badge amber" style={{ fontWeight: 800, color: 'var(--primary)' }}>
              #{i + 1}
            </div>
          ) : (
            <div className={`icon-badge ${met ? 'teal' : s.has_report_today ? 'rose' : 'amber'}`}>
              {s.has_report_today
                ? (met ? <CheckCircle2 size={20} color="#1a9d5c" /> : <AlertCircle size={20} color="#dc2626" />)
                : <Users size={20} color="var(--primary)" />}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span className="card-row-title">{s.full_name}</span>
              {stepDef && (
                <span className="pill" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.68rem', padding: '3px 8px' }}>
                  {stepDef.name}
                </span>
              )}
            </div>
            <div className="card-row-subtitle">
              {s.has_report_today
                ? `${s.japa_rounds}/${s.target_rounds} rounds · ${pct}% of target`
                : 'No report today yet'}
            </div>
            {(s.reading_material || s.hearing_material) && (
              <div className="card-row-subtitle" style={{ marginTop: '2px' }}>
                {s.reading_material && <>📖 {s.reading_material}</>}
                {s.reading_material && s.hearing_material && ' · '}
                {s.hearing_material && <>🎧 {s.hearing_material}</>}
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-outline btn-round" onClick={() => openEdit(s)} aria-label="Edit target">
          <Settings size={18} />
        </button>
      </div>
    );
  };

  // ---------- Overview screen ----------
  if (view === null) {
    return (
      <div className="page fade-in">
        <h2 className="page-title">Your Sadhakas</h2>
        <p className="page-subtitle" style={{ marginBottom: '20px' }}>
          Tap a card to see who's in it.
        </p>

        <div className="card card-pad" style={{ marginBottom: '18px' }}>
          <div className="input-label" style={{ marginBottom: '10px' }}>Your Mentor Code</div>
          {mentorCode ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary)' }}>
                {mentorCode}
              </div>
              <button className="btn btn-outline btn-round" onClick={copyCode} aria-label="Copy code">
                <Copy size={16} />
              </button>
              <button className="btn btn-outline btn-round" onClick={handleGenerateCode} disabled={generatingCode} aria-label="Regenerate code">
                <RefreshCw size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleGenerateCode} disabled={generatingCode}>
              {generatingCode ? 'Generating...' : 'Generate My Code'}
            </button>
          )}
          <p className="text-faint" style={{ fontSize: '0.78rem', marginTop: '10px', marginBottom: 0 }}>
            Share this with a sadhaka — they'll enter it in their Profile page to connect to you.
          </p>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button className="stat-card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setView('all')}>
              <div className="stat-label" style={{ color: 'var(--primary)' }}>
                <Users size={16} /> Total Sadhakas
              </div>
              <div className="stat-value">{sadhakas.length}</div>
            </button>

            <button className="stat-card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setView('below')}>
              <div className="stat-label" style={{ color: '#dc2626' }}>
                <AlertCircle size={16} /> Below Target
              </div>
              <div className="stat-value">{belowTarget.length}</div>
            </button>

            <button className="stat-card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setView('not_reported')}>
              <div className="stat-label" style={{ color: 'var(--text-faint)' }}>
                <HelpCircle size={16} /> Not Reported
              </div>
              <div className="stat-value">{notReported.length}</div>
            </button>

            <button className="stat-card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setView('completed')}>
              <div className="stat-label" style={{ color: '#1a9d5c' }}>
                <Trophy size={16} /> Completed
              </div>
              <div className="stat-value">{completed.length}</div>
            </button>
          </div>
        )}

        {editingId && (
          <TargetModal
            editRounds={editRounds} setEditRounds={setEditRounds}
            editReading={editReading} setEditReading={setEditReading}
            editHearing={editHearing} setEditHearing={setEditHearing}
            useStepMode={useStepMode} setUseStepMode={setUseStepMode}
            editBhaktiStep={editBhaktiStep} onSelectStep={handleSelectStep}
            saving={saving} onCancel={() => setEditingId(null)} onSave={saveTarget}
          />
        )}
      </div>
    );
  }

  // ---------- Filtered list screen ----------
  const rows = listFor(view);
  const meta = VIEW_META[view];

  return (
    <div className="page fade-in">
      <button
        onClick={() => setView(null)}
        className="btn btn-outline"
        style={{ marginBottom: '16px', padding: '8px 14px', fontSize: '0.85rem' }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="page-title">{meta.title}</h2>
      <p className="page-subtitle" style={{ marginBottom: '20px' }}>
        {rows.length} sadhaka{rows.length === 1 ? '' : 's'}
      </p>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={24} color="var(--primary)" /></div>
            {meta.empty}
          </div>
        ) : (
          rows.map((s, i) => renderRow(s, i))
        )}
      </div>

      {editingId && (
        <TargetModal
          editRounds={editRounds} setEditRounds={setEditRounds}
          editReading={editReading} setEditReading={setEditReading}
          editHearing={editHearing} setEditHearing={setEditHearing}
          useStepMode={useStepMode} setUseStepMode={setUseStepMode}
          editBhaktiStep={editBhaktiStep} onSelectStep={handleSelectStep}
          saving={saving} onCancel={() => setEditingId(null)} onSave={saveTarget}
        />
      )}
    </div>
  );
}

function TargetModal({
  editRounds, setEditRounds, editReading, setEditReading, editHearing, setEditHearing,
  useStepMode, setUseStepMode, editBhaktiStep, onSelectStep,
  saving, onCancel, onSave,
}: {
  editRounds: string; setEditRounds: (v: string) => void;
  editReading: string; setEditReading: (v: string) => void;
  editHearing: string; setEditHearing: (v: string) => void;
  useStepMode: boolean; setUseStepMode: (v: boolean) => void;
  editBhaktiStep: string; onSelectStep: (stepId: string) => void;
  saving: boolean; onCancel: () => void; onSave: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 className="modal-title" style={{ marginBottom: 0 }}>Set Targets</h3>
          <button className="btn btn-outline btn-round" onClick={onCancel} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="mode-toggle" style={{ marginTop: '18px' }}>
          <button
            type="button"
            className={`mode-toggle-btn${!useStepMode ? ' active' : ''}`}
            onClick={() => setUseStepMode(false)}
          >
            Manual Rounds
          </button>
          <button
            type="button"
            className={`mode-toggle-btn${useStepMode ? ' active' : ''}`}
            onClick={() => setUseStepMode(true)}
          >
            Bhakti Step
          </button>
        </div>

        {useStepMode ? (
          <div className="field-group" style={{ textAlign: 'left' }}>
            <label className="input-label">Assign Bhakti Step</label>
            <select
              className="input"
              value={editBhaktiStep}
              onChange={(e) => onSelectStep(e.target.value)}
            >
              <option value="">— Select a step —</option>
              {BHAKTI_STEPS.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.name} (min {step.minRounds} rounds)
                </option>
              ))}
            </select>
            {editBhaktiStep && (
              <p className="text-faint" style={{ fontSize: '0.78rem', marginTop: '8px', marginBottom: 0 }}>
                Min Japa Rounds set to {editRounds} automatically. You can still fine-tune it below.
              </p>
            )}
          </div>
        ) : null}

        <div className="field-group" style={{ textAlign: 'left', marginTop: useStepMode ? '4px' : '18px' }}>
          <label className="input-label">Minimum Japa Rounds</label>
          <input type="number" min="0" className="input" value={editRounds} onChange={(e) => setEditRounds(e.target.value)} />
        </div>
        <div className="field-group" style={{ textAlign: 'left' }}>
          <label className="input-label">Minimum Reading (minutes)</label>
          <input type="number" min="0" className="input" value={editReading} onChange={(e) => setEditReading(e.target.value)} />
        </div>
        <div className="field-group" style={{ textAlign: 'left' }}>
          <label className="input-label">Minimum Hearing (minutes)</label>
          <input type="number" min="0" className="input" value={editHearing} onChange={(e) => setEditHearing(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-outline" disabled={saving}>Cancel</button>
          <button onClick={onSave} className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Target'}
          </button>
        </div>
      </div>
    </div>
  );
}