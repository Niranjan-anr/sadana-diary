import { useEffect, useState } from 'react';
import { useSadhanaStore } from '../store/useSadhanaStore';
import { saveStudySession } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Play, Pause, Square, ExternalLink, BookOpen, Smartphone, Book, Search, Check } from 'lucide-react';

type BookDef = { id: string; title: string; aliases: string[]; urlPath: string; structure: 'standard' | 'cantos' | 'lilas' | 'none'; hasIntro?: boolean; maxChapters?: number; hasVerses?: boolean; maxCantos?: number; lilas?: { id: string; name: string; chapters: number }[]; };

const BOOKS: BookDef[] = [
  { id: 'bg', title: 'Bhagavad-gita As It Is', aliases: ['gita', 'bagavath', 'bhagavat', 'bg'], urlPath: 'bg', structure: 'standard', hasIntro: true, maxChapters: 18, hasVerses: true },
  { id: 'sb', title: 'Srimad-Bhagavatam', aliases: ['bhagavatam', 'bagavatam', 'sb'], urlPath: 'sb', structure: 'cantos', maxCantos: 12, hasVerses: true },
  { id: 'cc', title: 'Caitanya-caritamrta', aliases: ['chaitanya', 'charitamrita', 'cc'], urlPath: 'cc', structure: 'lilas', lilas: [{ id: 'adi', name: 'Adi-lila', chapters: 17 }, { id: 'madhya', name: 'Madhya-lila', chapters: 25 }, { id: 'antya', name: 'Antya-lila', chapters: 20 }], hasVerses: true },
  { id: 'nod', title: 'Nectar of Devotion', aliases: ['nod', 'nectar', 'devotion'], urlPath: 'nod', structure: 'standard', maxChapters: 51, hasVerses: false },
  { id: 'kb', title: 'Krishna Book', aliases: ['krsna', 'kb'], urlPath: 'kb', structure: 'standard', maxChapters: 90, hasVerses: false },
  { id: 'ssr', title: 'Science of Self Realization', aliases: ['ssr', 'science', 'self'], urlPath: 'ssr', structure: 'standard', maxChapters: 8, hasVerses: false },
  { id: 'noi', title: 'Nectar of Instruction', aliases: ['noi', 'instruction', 'upadesamrta'], urlPath: 'noi', structure: 'standard', maxChapters: 11, hasVerses: false },
  { id: 'iso', title: 'Sri Isopanisad', aliases: ['iso', 'isopanisad'], urlPath: 'iso', structure: 'standard', hasIntro: true, maxChapters: 18, hasVerses: false },
  { id: 'tlc', title: 'Teachings of Lord Caitanya', aliases: ['tlc', 'teachings'], urlPath: 'tlc', structure: 'standard', maxChapters: 32, hasVerses: false },
  { id: 'tqk', title: 'Teachings of Queen Kunti', aliases: ['tqk', 'kunti'], urlPath: 'tqk', structure: 'standard', maxChapters: 26, hasVerses: false },
  { id: 'bbd', title: 'Beyond Birth and Death', aliases: ['bbd', 'beyond'], urlPath: 'bbd', structure: 'standard', maxChapters: 5, hasVerses: false },
  { id: 'pqpa', title: 'Perfect Questions, Perfect Answers', aliases: ['pqpa', 'perfect'], urlPath: 'pqpa', structure: 'standard', maxChapters: 9, hasVerses: false },
  { id: 'pop', title: 'The Path of Perfection', aliases: ['pop', 'path'], urlPath: 'pop', structure: 'standard', maxChapters: 10, hasVerses: false },
  { id: 'jsd', title: 'The Journey of Self Discovery', aliases: ['jsd', 'journey'], urlPath: 'jsd', structure: 'standard', maxChapters: 8, hasVerses: false },
  { id: 'lcfl', title: 'Life Comes From Life', aliases: ['lcfl', 'life'], urlPath: 'lcfl', structure: 'standard', maxChapters: 16, hasVerses: false }
];

export default function Reading() {
  const { readingSeconds, isReading, toggleTimer, tickTimer, resetTimer } = useSadhanaStore();
  const [readMode, setReadMode] = useState<'physical' | 'phone'>('phone');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBook, setSelectedBook] = useState<BookDef>(BOOKS[0]);
  const [selectedCanto, setSelectedCanto] = useState('1');
  const [selectedLila, setSelectedLila] = useState('adi');
  const [selectedChapter, setSelectedChapter] = useState('intro'); // BG has intro
  const [selectedShloka, setSelectedShloka] = useState('');
  
  const [notes, setNotes] = useState('');
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
    if (isReading) interval = window.setInterval(() => tickTimer(), 1000);
    return () => clearInterval(interval);
  }, [isReading, tickTimer]);

  const getVedabaseUrl = () => {
    let base = `https://vedabase.io/en/library/${selectedBook.urlPath}/`;

    if (selectedChapter === 'intro') {
      return base + 'introduction/';
    }

    if (selectedBook.structure === 'cantos') {
      base += `${selectedCanto}/${selectedChapter}/`;
    } else if (selectedBook.structure === 'lilas') {
      base += `${selectedLila}/${selectedChapter}/`;
    } else if (selectedBook.structure === 'standard') {
      base += `${selectedChapter}/`;
    }

    if (selectedBook.hasVerses && selectedShloka.trim()) {
      base += `${selectedShloka.trim()}/`;
    }

    return base;
  };

  const handleStartReading = () => {
    if (!isReading) toggleTimer();
    if (readMode === 'phone') {
      window.open(getVedabaseUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmStop = async () => {
    setShowConfirmModal(false);
    let title = readMode === 'phone' ? selectedBook.title : 'Physical Book Reading';
    if (readMode === 'phone') {
      if (selectedChapter === 'intro') {
        title += ` Introduction`;
      } else {
        if (selectedBook.structure === 'cantos') title += ` Canto ${selectedCanto}`;
        if (selectedBook.structure === 'lilas') title += ` ${selectedBook.lilas?.find(l => l.id === selectedLila)?.name}`;
        if (selectedBook.structure !== 'none') title += ` Ch ${selectedChapter}`;
        if (selectedBook.hasVerses && selectedShloka.trim()) title += ` Verse ${selectedShloka.trim()}`;
      }
    }
    
    if (userId) await saveStudySession(userId, 'reading', title, readingSeconds, notes);
    
    resetTimer();
    setNotes('');
    setSelectedShloka('');
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleBookChange = (book: BookDef) => {
    setSelectedBook(book);
    setSearchQuery('');
    setSelectedCanto('1');
    setSelectedLila('adi');
    setSelectedChapter(book.hasIntro ? 'intro' : '1');
    setSelectedShloka('');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredBooks = BOOKS.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}>
      <h2 className="header-title">Scripture Study</h2>

      {saveSuccessMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <Check size={18} /> Reading session logged successfully!
        </div>
      )}

      {/* Mode Toggle */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
        <button 
          onClick={() => setReadMode('physical')} 
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '6px', background: readMode === 'physical' ? 'white' : 'transparent', border: 'none', fontWeight: 'bold', boxShadow: readMode === 'physical' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: readMode === 'physical' ? 'var(--primary)' : '#6b7280', cursor: 'pointer' }}
        >
          <Book size={18} /> Physical Book
        </button>
        <button 
          onClick={() => setReadMode('phone')} 
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '6px', background: readMode === 'phone' ? 'white' : 'transparent', border: 'none', fontWeight: 'bold', boxShadow: readMode === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: readMode === 'phone' ? 'var(--primary)' : '#6b7280', cursor: 'pointer' }}
        >
          <Smartphone size={18} /> Phone
        </button>
      </div>

      {readMode === 'phone' && (
        <div style={{ marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', padding: '10px 15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' }}>
            <Search size={18} color="#6b7280" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search (e.g., 'cc', 'gita', 'ssr')" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontSize: '1rem' }}
            />
          </div>

          {searchQuery && (
            <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              {filteredBooks.map(b => (
                <div 
                  key={b.id} 
                  onClick={() => handleBookChange(b)} 
                  style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedBook.id === b.id ? 'var(--bg-main)' : 'white' }}
                >
                  {b.title}
                </div>
              ))}
            </div>
          )}

          <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px' }}>{selectedBook.title}</div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Canto Dropdown (For Bhagavatam) */}
            {selectedBook.structure === 'cantos' && (
              <div style={{ flex: 1, minWidth: '90px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Canto</label>
                <select value={selectedCanto} onChange={(e) => setSelectedCanto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                  {Array.from({length: selectedBook.maxCantos || 12}, (_, i) => <option key={i+1} value={i+1}>Canto {i+1}</option>)}
                </select>
              </div>
            )}

            {/* Lila Dropdown (For Caitanya-caritamrta) */}
            {selectedBook.structure === 'lilas' && selectedBook.lilas && (
              <div style={{ flex: 1, minWidth: '90px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Lila</label>
                <select value={selectedLila} onChange={(e) => { setSelectedLila(e.target.value); setSelectedChapter('1'); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                  {selectedBook.lilas.map(lila => <option key={lila.id} value={lila.id}>{lila.name}</option>)}
                </select>
              </div>
            )}
            
            {/* Chapter Dropdown */}
            {selectedBook.structure !== 'none' && (
              <div style={{ flex: 1, minWidth: '90px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#6b7280', fontWeight: 'bold' }}>Chapter</label>
                
                {selectedBook.structure === 'cantos' ? (
                  <input type="number" min="1" value={selectedChapter !== 'intro' ? selectedChapter : '1'} onChange={(e) => setSelectedChapter(e.target.value)} placeholder="Ch #" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                ) : (
                  <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }}>
                    {selectedBook.hasIntro && <option value="intro">Introduction</option>}
                    
                    {Array.from({length: selectedBook.structure === 'lilas' ? (selectedBook.lilas?.find(l => l.id === selectedLila)?.chapters || 1) : (selectedBook.maxChapters || 1)}, (_, i) => 
                      <option key={i+1} value={i+1}>Chapter {i+1}</option>
                    )}
                  </select>
                )}
              </div>
            )}

            {/* Shloka Input (Hidden if Introduction is selected) */}
            {selectedBook.hasVerses && selectedChapter !== 'intro' && (
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
      )}

      {/* Timer Card */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '30px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-main)', marginBottom: '20px' }}>
          {formatTime(readingSeconds)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button onClick={isReading && readMode === 'physical' ? toggleTimer : handleStartReading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {readMode === 'phone' ? <ExternalLink size={20} /> : (isReading ? <Pause size={20} /> : <Play size={20} />)}
            {readMode === 'phone' ? 'Open & Read' : (isReading ? 'Pause Timer' : 'Start Timer')}
          </button>
          
          <button onClick={() => { if (readingSeconds > 0) setShowConfirmModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', border: '1px solid #eee', background: 'white', color: '#ef4444', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            <Square size={20} /> Stop
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
          <BookOpen size={16} color="var(--primary)" /> Session Notes
        </label>
        <textarea 
          placeholder="Jot down realizations while you read..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ flex: 1, width: '100%', boxSizing: 'border-box', padding: '15px', borderRadius: '12px', border: '1px solid #eee', fontSize: '0.95rem', resize: 'none', background: '#fff' }}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>Finish Session?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '25px' }}>
              Do you want to log your reading duration ({formatTime(readingSeconds)}) to your Sadhana diary?
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