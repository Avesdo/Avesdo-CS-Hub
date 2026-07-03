import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Send, Activity, MessageSquare, User, Filter, Edit3, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';

export interface Note {
  id: string;
  text: string;
  timestamp: number;
  author: string;
  isSystem?: boolean;
}

interface TimelineTabProps {
  notes: Note[];
  onSaveNotes: (updatedNotes: Note[]) => Promise<void>;
  emptyStateMessage?: string;
  disabled?: boolean;
}

export function TimelineTab({
  notes,
  onSaveNotes,
  emptyStateMessage = 'No activity recorded yet.',
  disabled = false,
}: TimelineTabProps) {
  const user = useAppStore((state) => state.user);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<'All' | 'Notes' | 'Logs'>('All');
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  useEffect(() => {
    setLocalNotes(notes || []);
  }, [notes]);

  const handleAddNote = async () => {
    const plainText = newNote.replace(/<[^>]*>/g, '').trim();
    if (!plainText) return;

    setIsSaving(true);
    const noteObj: Note = {
      id: crypto.randomUUID(),
      text: newNote,
      timestamp: new Date().getTime(),
      author: user?.name || 'Unknown User',
      isSystem: false,
    };

    const currentNotes = notes || [];
    const updatedNotes = [noteObj, ...currentNotes];

    setLocalNotes(updatedNotes);
    setNewNote('');
    setIsComposerExpanded(false);

    try {
      await onSaveNotes(updatedNotes);
    } catch (err) {
      console.error(err);
      setLocalNotes(currentNotes);
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = newNote.replace(/<[^>]*>/g, '').trim().length > 0;

  const groupedNotes = useMemo(() => {
    const filtered = localNotes.filter((note) => {
      const isSystem =
        note.isSystem ||
        note.author === 'System' ||
        note.text.includes(' changed from ') ||
        note.text.includes(' updated from ') ||
        note.text.includes(' created ');
      if (filter === 'Notes') return !isSystem;
      if (filter === 'Logs') return isSystem;
      return true;
    });

    const groups: { [key: string]: Note[] } = {};
    filtered.forEach((note) => {
      const d = new Date(note.timestamp);
      const now = new Date();
      // Reset times to compare strictly by dates
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = Math.abs(nowOnly.getTime() - dateOnly.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let header = '';
      if (diffDays === 0) header = 'Today';
      else if (diffDays === 1) header = 'Yesterday';
      else header = d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

      if (!groups[header]) groups[header] = [];
      groups[header].push(note);
    });

    return groups;
  }, [localNotes, filter]);

  return (
    <div className="flex flex-col h-full mx-auto w-full max-w-3xl">
      {/* Header with Smart Composer and Filters */}
      <div className="pt-2 pb-6 border-b border-slate-100/60 mb-6">
        {/* Smart Composer */}
        <div className="mb-4">
          <AnimatePresence initial={false} mode="wait">
            {!isComposerExpanded ? (
              <motion.button
                key="collapsed"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => !disabled && setIsComposerExpanded(true)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 border rounded-xl text-slate-400 transition-colors shadow-sm ${disabled ? 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:text-slate-600 cursor-text'}`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Write a note...</span>
              </motion.button>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary/20 flex flex-col overflow-hidden"
              >
                <RichTextEditor content={newNote} onChange={setNewNote} disabled={isSaving} />
                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsComposerExpanded(false);
                      setNewNote('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={isSaving || !hasContent}
                    className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] h-9 px-6 disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                    Post Note
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Pill Segmented Control */}
        <div className="inline-flex bg-slate-100/80 p-1 rounded-xl shadow-inner">
          {['All', 'Notes', 'Logs'].map((t) => {
            const isActive = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`relative flex items-center justify-center px-6 py-1.5 text-[13px] font-bold transition-all duration-300 rounded-lg z-10 outline-none ${
                  isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
                <span className="relative z-20 flex items-center gap-2">
                  {t === 'All' && <Filter className="w-3.5 h-3.5" />}
                  {t === 'Notes' && <MessageSquare className="w-3.5 h-3.5" />}
                  {t === 'Logs' && <Activity className="w-3.5 h-3.5" />}
                  {t === 'All' ? 'All Activity' : t === 'Notes' ? 'Notes Only' : 'System Logs'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Feed */}
      <div id="drawerNotesList" className="flex-1 pb-12">
        {Object.keys(groupedNotes).length > 0 ? (
          <div className="relative border-l-2 border-slate-100/80 ml-[19px] space-y-10 pb-8">
            {Object.keys(groupedNotes).map((dateHeader) => (
              <div key={dateHeader} className="relative">
                {/* Date Group Header */}
                <div className="sticky top-0 z-30 -ml-[19px] mb-6 flex items-center pt-2">
                  <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm text-[12px] font-semibold text-slate-600 tracking-wide relative -left-[19px]">
                    {dateHeader}
                  </div>
                </div>

                <div className="space-y-5">
                  {groupedNotes[dateHeader].map((note) => {
                    const isSystem =
                      note.isSystem ||
                      note.author === 'System' ||
                      note.text.includes(' changed from ') ||
                      note.text.includes(' updated from ') ||
                      note.text.includes(' created ');
                    const parsedDate = new Date(note.timestamp);
                    const timeString = isNaN(parsedDate.getTime())
                      ? ''
                      : parsedDate.toLocaleString([], { hour: 'numeric', minute: '2-digit' });

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative group pl-8"
                      >
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-[15px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-colors ${
                            isSystem
                              ? 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {isSystem ? (
                            <Activity className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Content Body */}
                        {isSystem ? (
                          // Muted System Log
                          <div className="pt-2 pb-1 pr-4">
                            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                              <span className="font-bold text-slate-700 mr-1.5">{note.author}</span>
                              {note.text}
                            </p>
                            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                              {timeString}
                            </span>
                          </div>
                        ) : (
                          // Elevated Human Note Card
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                {note.author}
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px] font-semibold">
                                  Note
                                </span>
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {timeString}
                              </span>
                            </div>

                            {note.text.includes('<p>') ? (
                              <div
                                className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: note.text }}
                              />
                            ) : (
                              <div className="whitespace-pre-wrap leading-relaxed text-[14px] text-slate-700">
                                {note.text}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">No Activity Found</h3>
            <p className="text-[13px] text-slate-500 max-w-[250px]">{emptyStateMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
