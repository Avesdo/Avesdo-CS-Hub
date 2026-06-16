import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Send, Activity, MessageSquare, User } from 'lucide-react';

export interface Note {
  id: string;
  text: string;
  timestamp: number;
  author: string;
  isSystem?: boolean;
}

interface NotesTabProps {
  notes: Note[];
  onSaveNotes: (updatedNotes: Note[]) => Promise<void>;
  emptyStateMessage?: string;
}

export function NotesTab({
  notes,
  onSaveNotes,
  emptyStateMessage = 'Be the first to add a note.',
}: NotesTabProps) {
  const { user } = useAppState();
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);

  useEffect(() => {
    setLocalNotes(notes || []);
  }, [notes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSaving(true);
    const noteObj: Note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      timestamp: new Date().getTime(),
      author: user?.name || 'Unknown User',
      isSystem: false,
    };

    const currentNotes = notes || [];
    const updatedNotes = [noteObj, ...currentNotes];

    setLocalNotes(updatedNotes);
    setNewNote('');

    try {
      await onSaveNotes(updatedNotes);
    } catch (err) {
      console.error(err);
      setLocalNotes(currentNotes);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-border mb-6 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300 flex flex-col">
        <textarea
          id="newNoteText"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full bg-transparent px-4 py-3 outline-none text-sm min-h-[80px] resize-none placeholder:text-muted-foreground/60 rounded-t-2xl"
          placeholder="Write an internal note or update..."
        ></textarea>
        <div className="flex justify-end items-center px-3 py-2">
          <button
            onClick={handleAddNote}
            disabled={isSaving || !newNote.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md h-9 px-5 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      <div id="drawerNotesList" className="flex-1 pb-12">
        {localNotes.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-5 pl-6 space-y-4">
            {localNotes.map((note) => {
              const isSystem =
                note.isSystem ||
                note.author === 'System' ||
                note.text.includes(' changed from ') ||
                note.text.includes(' updated from ') ||
                note.text.includes(' created ');
              const parsedDate = new Date(note.timestamp);
              const timeString = isNaN(parsedDate.getTime())
                ? 'Unknown Time'
                : parsedDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

              return (
                <div key={note.id} className="relative group">
                  <div
                    className={`absolute -left-[38px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${isSystem ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}
                  >
                    {isSystem ? (
                      <Activity className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all">
                    <div
                      className={`whitespace-pre-wrap leading-relaxed text-sm mb-2.5 ${isSystem ? 'text-slate-600 font-medium' : 'text-slate-800'}`}
                    >
                      {note.text}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                      <span className={isSystem ? 'text-slate-500' : 'text-primary font-bold'}>
                        {note.author}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{timeString}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No notes yet</h3>
            <p className="text-sm text-slate-500 max-w-[250px]">{emptyStateMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
