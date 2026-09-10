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
  const [selectedChapter, setSelectedChapter] = useState('intro');
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
    if (selectedChapter === 'intro') return base + 'introduction/';
    if (selectedBook.structure === 'cantos') base += `${selectedCanto}/${selectedChapter}/`;
    else if (selectedBook.structure === 'lilas') base += `${selectedLila}/${selectedChapter}/`;
    else if (selectedBook.structure === 'standard') base += `${selectedChapter}/`;
    if (selectedBook.hasVerses && selectedShloka.trim()) base += `${selectedShloka.trim()}/`;
    return base;
  };

  const handleStartReading = () => {
    if (!isReading) toggleTimer();
    if (readMode === 'phone') window.open(getVedabaseUrl(), '_blank', 'noopener,noreferrer');
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
    <div className="page fade-in">
      <h2 className="header-title">Scripture Study</h2>

      {saveSuccessMsg && (
        <div className="success-banner"><Check size={18} /> Reading session logged successfully!</div>
      )}

      <div className="mode-toggle">
        <button onClick={() => setReadMode('physical')} className={`mode-toggle-btn${readMode === 'physical' ? ' active' : ''}`}>
          <Book size={18} /> Physical Book
        </button>
        <button onClick={() => setReadMode('phone')} className={`mode-toggle-btn${readMode === 'phone' ? ' active' : ''}`}>
          <Smartphone size={18} /> Phone
        </button>
      </div>

      {readMode === 'phone' && (
        <div className="selector-panel">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search (e.g., 'cc', 'gita', 'ssr')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (
            <div className="search-results">
              {filteredBooks.map(b => (
                <div key={b.id} onClick={() => handleBookChange(b)} className={`search-result-item${selectedBook.id === b.id ? ' selected' : ''}`}>
                  {b.title}
                </div>
              ))}
            </div>
          )}

          <div className="selected-title">{selectedBook.title}</div>

          <div className="selector-row">
            {selectedBook.structure === 'cantos' && (
              <div className="selector-field">
                <label>Canto</label>
                <select value={selectedCanto} onChange={(e) => setSelectedCanto(e.target.value)}>
                  {Array.from({ length: selectedBook.maxCantos || 12 }, (_, i) => <option key={i + 1} value={i + 1}>Canto {i + 1}</option>)}
                </select>
              </div>
            )}

            {selectedBook.structure === 'lilas' && selectedBook.lilas && (
              <div className="selector-field">
                <label>Lila</label>
                <select value={selectedLila} onChange={(e) => { setSelectedLila(e.target.value); setSelectedChapter('1'); }}>
                  {selectedBook.lilas.map(lila => <option key={lila.id} value={lila.id}>{lila.name}</option>)}
                </select>
              </div>
            )}

            {selectedBook.structure !== 'none' && (
              <div className="selector-field">
                <label>Chapter</label>
                {selectedBook.structure === 'cantos' ? (
                  <input type="number" min="1" value={selectedChapter !== 'intro' ? selectedChapter : '1'} onChange={(e) => setSelectedChapter(e.target.value)} placeholder="Ch #" />
                ) : (
                  <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
                    {selectedBook.hasIntro && <option value="intro">Introduction</option>}
                    {Array.from({ length: selectedBook.structure === 'lilas' ? (selectedBook.lilas?.find(l => l.id === selectedLila)?.chapters || 1) : (selectedBook.maxChapters || 1) }, (_, i) =>
                      <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                    )}
                  </select>
                )}
              </div>
            )}

            {selectedBook.hasVerses && selectedChapter !== 'intro' && (
              <div className="selector-field">
                <label>Shloka / Verse</label>
                <input type="number" min="1" placeholder="Optional" value={selectedShloka} onChange={(e) => setSelectedShloka(e.target.value)} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="timer-card">
        <div className="timer-display">{formatTime(readingSeconds)}</div>
        <div className="timer-actions">
          <button onClick={isReading && readMode === 'physical' ? toggleTimer : handleStartReading} className="btn btn-primary">
            {readMode === 'phone' ? <ExternalLink size={20} /> : (isReading ? <Pause size={20} /> : <Play size={20} />)}
            {readMode === 'phone' ? 'Open & Read' : (isReading ? 'Pause Timer' : 'Start Timer')}
          </button>
          <button onClick={() => { if (readingSeconds > 0) setShowConfirmModal(true); }} className="btn btn-danger-outline">
            <Square size={20} /> Stop
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label className="notes-label"><BookOpen size={16} color="var(--primary)" /> Session Notes</label>
        <textarea
          placeholder="Jot down realizations while you read..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-textarea"
        />
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Finish Session?</h3>
            <p className="modal-text">
              Do you want to log your reading duration ({formatTime(readingSeconds)}) to your Sadhana diary?
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