import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { saveStudySession } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Square, Search, Play, Headphones, Check } from 'lucide-react';

type CategoryDef = { id: string; title: string; aliases: string[]; structure: 'standard' | 'cantos' | 'lilas' | 'none'; hasIntro?: boolean; maxChapters?: number; hasVerses?: boolean; maxCantos?: number; lilas?: { id: string; name: string; chapters: number }[]; };

const LECTURE_CATEGORIES: CategoryDef[] = [
  { id: 'bg', title: 'Bhagavad-gita Classes', aliases: ['gita', 'bagavath', 'bhagavat', 'bg'], structure: 'standard', hasIntro: true, maxChapters: 18, hasVerses: true },
  { id: 'sb', title: 'Srimad-Bhagavatam Classes', aliases: ['bhagavatam', 'bagavatam', 'sb'], structure: 'cantos', maxCantos: 12, hasVerses: true },
  { id: 'cc', title: 'Caitanya-caritamrta Classes', aliases: ['chaitanya', 'charitamrita', 'cc'], structure: 'lilas', lilas: [{ id: 'adi', name: 'Adi-lila', chapters: 17 }, { id: 'madhya', name: 'Madhya-lila', chapters: 25 }, { id: 'antya', name: 'Antya-lila', chapters: 20 }], hasVerses: true },
  { id: 'nod', title: 'Nectar of Devotion Classes', aliases: ['nod', 'devotion'], structure: 'standard', maxChapters: 51, hasVerses: false },
  { id: 'mw', title: 'Morning Walks', aliases: ['walks', 'morning'], structure: 'none' },
  { id: 'kirtan', title: 'Bhajans & Kirtans', aliases: ['kirtan', 'bhajan', 'singing'], structure: 'none' }
];

export default function Hearing() {
  const { hearingSeconds, isHearing, toggleHearingTimer, tickHearingTimer, resetHearingTimer } = useSadhanaStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<CategoryDef>(LECTURE_CATEGORIES[0]);
  const [selectedCanto, setSelectedCanto] = useState('1');
  const [selectedLila, setSelectedLila] = useState('adi');
  const [selectedChapter, setSelectedChapter] = useState('intro');
  const [selectedShloka, setSelectedShloka] = useState('');

  const [userId, setUserId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    let interval: number;
    if (isHearing) interval = window.setInterval(() => tickHearingTimer(), 1000);
    return () => clearInterval(interval);
  }, [isHearing, tickHearingTimer]);

  const getYoutubeSearchUrl = () => {
    let query = `Srila Prabhupada ${selectedCategory.title}`;
    if (selectedChapter === 'intro') {
      query += ` Introduction`;
    } else {
      if (selectedCategory.structure === 'cantos') query += ` Canto ${selectedCanto}`;
      if (selectedCategory.structure === 'lilas') query += ` ${selectedCategory.lilas?.find(l => l.id === selectedLila)?.name}`;
      if (selectedCategory.structure !== 'none') query += ` Chapter ${selectedChapter}`;
      if (selectedCategory.hasVerses && selectedShloka.trim()) query += ` Verse ${selectedShloka.trim()}`;
    }
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  const handleStartHearing = () => {
    if (!isHearing) toggleHearingTimer();
    window.open(getYoutubeSearchUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleConfirmStop = async () => {
    setShowConfirmModal(false);
    let title = selectedCategory.title;
    if (selectedChapter === 'intro') {
      title += ` Introduction`;
    } else {
      if (selectedCategory.structure === 'cantos') title += ` Canto ${selectedCanto}`;
      if (selectedCategory.structure === 'lilas') title += ` ${selectedCategory.lilas?.find(l => l.id === selectedLila)?.name}`;
      if (selectedCategory.structure !== 'none') title += ` Ch ${selectedChapter}`;
      if (selectedCategory.hasVerses && selectedShloka.trim()) title += ` Verse ${selectedShloka.trim()}`;
    }
    if (userId) await saveStudySession(userId, 'hearing', title, hearingSeconds);
    resetHearingTimer();
    setSelectedShloka('');
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleCategoryChange = (category: CategoryDef) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSelectedCanto('1');
    setSelectedLila('adi');
    setSelectedChapter(category.hasIntro ? 'intro' : '1');
    setSelectedShloka('');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredCategories = LECTURE_CATEGORIES.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page fade-in">
      <h2 className="header-title">Prabhupada Vani</h2>
      <p className="page-subtitle" style={{ marginBottom: '20px' }}>
        Search lectures and shlokas. Streams seamlessly via YouTube.
      </p>

      {saveSuccessMsg && (
        <div className="success-banner"><Check size={18} /> Hearing session logged successfully!</div>
      )}

      <div className="selector-panel">
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search audio (e.g., 'bag', 'cc', 'kirtan')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery && (
          <div className="search-results">
            {filteredCategories.map(c => (
              <div key={c.id} onClick={() => handleCategoryChange(c)} className={`search-result-item${selectedCategory.id === c.id ? ' selected' : ''}`}>
                <Headphones size={16} color="var(--primary)" /> {c.title}
              </div>
            ))}
          </div>
        )}

        <div className="selected-title">{selectedCategory.title}</div>

        <div className="selector-row">
          {selectedCategory.structure === 'cantos' && (
            <div className="selector-field">
              <label>Canto</label>
              <select value={selectedCanto} onChange={(e) => setSelectedCanto(e.target.value)}>
                {Array.from({ length: selectedCategory.maxCantos || 12 }, (_, i) => <option key={i + 1} value={i + 1}>Canto {i + 1}</option>)}
              </select>
            </div>
          )}

          {selectedCategory.structure === 'lilas' && selectedCategory.lilas && (
            <div className="selector-field">
              <label>Lila</label>
              <select value={selectedLila} onChange={(e) => { setSelectedLila(e.target.value); setSelectedChapter('1'); }}>
                {selectedCategory.lilas.map(lila => <option key={lila.id} value={lila.id}>{lila.name}</option>)}
              </select>
            </div>
          )}

          {selectedCategory.structure !== 'none' && (
            <div className="selector-field">
              <label>Chapter</label>
              {selectedCategory.structure === 'cantos' ? (
                <input type="number" min="1" value={selectedChapter !== 'intro' ? selectedChapter : '1'} onChange={(e) => setSelectedChapter(e.target.value)} placeholder="Ch #" />
              ) : (
                <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
                  {selectedCategory.hasIntro && <option value="intro">Introduction</option>}
                  {Array.from({ length: selectedCategory.structure === 'lilas' ? (selectedCategory.lilas?.find(l => l.id === selectedLila)?.chapters || 1) : (selectedCategory.maxChapters || 1) }, (_, i) =>
                    <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                  )}
                </select>
              )}
            </div>
          )}

          {selectedCategory.hasVerses && selectedChapter !== 'intro' && (
            <div className="selector-field">
              <label>Shloka / Verse</label>
              <input type="number" min="1" placeholder="Optional" value={selectedShloka} onChange={(e) => setSelectedShloka(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <div className="timer-card">
        <div className="timer-display">{formatTime(hearingSeconds)}</div>
        <div className="timer-actions">
          <button onClick={handleStartHearing} className="btn btn-youtube">
            <Play size={20} fill="currentColor" /> Listen on YouTube
          </button>
          <button onClick={() => { if (hearingSeconds > 0) setShowConfirmModal(true); }} className="btn btn-outline btn-pill" style={{ color: '#c1121f', borderColor: '#f3c6c6' }}>
            <Square size={20} /> Stop
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Finish Session?</h3>
            <p className="modal-text">
              Do you want to log your hearing duration ({formatTime(hearingSeconds)}) to your Sadhana diary?
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleConfirmStop} className="btn btn-primary">Log Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}