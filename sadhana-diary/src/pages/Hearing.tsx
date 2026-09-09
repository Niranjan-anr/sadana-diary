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
    <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}>
      <h2 className="header-title">Prabhupada Vani</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.9rem' }}>
        Search lectures and shlokas. Streams seamlessly via YouTube.
      </p>

      {saveSuccessMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <Check size={18} /> Hearing session logged successfully!
        </div>
      )}

      <div style={{ marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', padding: '10px 15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' }}>
          <Search size={18} color="#6b7280" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Search audio (e.g., 'bag', 'cc', 'kirtan')" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontSize: '1rem' }}
          />
        </div>

        {searchQuery && (
          <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
            {filteredCategories.map(c => (
              <div 
                key={c.id} 
                onClick={() => handleCategoryChange(c)} 
                style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedCategory.id === c.id ? 'var(--bg-main)' : 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Headphones size={16} color="var(--primary)" /> {c.title}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px' }}>{selectedCategory.title}</div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          {selectedCategory.structure === 'cantos' && (
            <div style={{ flex: 1, minWidth: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Canto</label>
              <select value={selectedCanto} onChange={(e) => setSelectedCanto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                {Array.from({length: selectedCategory.maxCantos || 12}, (_, i) => <option key={i+1} value={i+1}>Canto {i+1}</option>)}
              </select>
            </div>
          )}

          {selectedCategory.structure === 'lilas' && selectedCategory.lilas && (
            <div style={{ flex: 1, minWidth: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Lila</label>
              <select value={selectedLila} onChange={(e) => { setSelectedLila(e.target.value); setSelectedChapter('1'); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                {selectedCategory.lilas.map(lila => <option key={lila.id} value={lila.id}>{lila.name}</option>)}
              </select>
            </div>
          )}
          
          {selectedCategory.structure !== 'none' && (
            <div style={{ flex: 1, minWidth: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Chapter</label>
              {selectedCategory.structure === 'cantos' ? (
                <input type="number" min="1" value={selectedChapter !== 'intro' ? selectedChapter : '1'} onChange={(e) => setSelectedChapter(e.target.value)} placeholder="Ch #" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              ) : (
                <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                  {selectedCategory.hasIntro && <option value="intro">Introduction</option>}
                  {Array.from({length: selectedCategory.structure === 'lilas' ? (selectedCategory.lilas?.find(l => l.id === selectedLila)?.chapters || 1) : (selectedCategory.maxChapters || 1)}, (_, i) => 
                    <option key={i+1} value={i+1}>Chapter {i+1}</option>
                  )}
                </select>
              )}
            </div>
          )}

          {selectedCategory.hasVerses && selectedChapter !== 'intro' && (
            <div style={{ flex: 1, minWidth: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Shloka / Verse</label>
              <input 
                type="number" 
                min="1" 
                placeholder="Optional" 
                value={selectedShloka} 
                onChange={(e) => setSelectedShloka(e.target.value)} 
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} 
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-main)', marginBottom: '20px' }}>
          {formatTime(hearingSeconds)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button 
            onClick={handleStartHearing} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '30px', border: 'none', background: '#FF0000', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 15px rgba(255, 0, 0, 0.3)', transition: 'transform 0.1s' }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play size={20} fill="currentColor" /> Listen on YouTube
          </button>
          
          <button 
            onClick={() => { if (hearingSeconds > 0) setShowConfirmModal(true); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 20px', borderRadius: '30px', border: '1px solid #e5e7eb', background: 'white', color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
          >
            <Square size={20} /> Stop
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>Finish Session?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '25px' }}>
              Do you want to log your hearing duration ({formatTime(hearingSeconds)}) to your Sadhana diary?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmStop} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Log Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}