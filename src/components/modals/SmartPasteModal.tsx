import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle2, FileJson, AlertCircle } from 'lucide-react';
import { academyService } from '../../api/academyService';
import { useAppStore } from '../../store/useAppStore';
import { QuizQuestion, Quiz } from '../../types';
import toast from 'react-hot-toast';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const promptTemplate = `Return the result strictly as a JSON array of objects, with NO markdown formatting (no \`\`\`json) or extra text.

Schema of each object MUST exactly match:
{
  "id": "A unique string ID (e.g. q1)",
  "text": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "Why this answer is correct. (Include the name of the source article here as well)",
  "sourceArticleId": "The ID of the article"
}`;

export default function SmartPasteModal({ isOpen, onClose, onSuccess }: SmartPasteModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      if (!jsonText.trim()) throw new Error('Please paste your JSON text first.');

      let parsed;
      try {
        // Strip out markdown if they accidentally copied it
        let cleanedText = jsonText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText
            .replace(/^```json/, '')
            .replace(/```$/, '')
            .trim();
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
        }
        parsed = JSON.parse(cleanedText);
      } catch (err) {
        throw new Error(
          'Invalid JSON format. Please make sure you copied exactly what Gemini outputted.'
        );
      }

      if (!Array.isArray(parsed)) {
        throw new Error('The JSON must be an array of questions.');
      }

      const questions: QuizQuestion[] = parsed.map((raw: any) => ({
        id: raw.id || 'q_' + Math.random().toString(36).substring(2, 9),
        text: raw.text || 'Error: Question text missing',
        options: Array.isArray(raw.options) ? raw.options : ['A', 'B', 'C', 'D'],
        correctAnswer: raw.correctAnswer || 'A',
        explanation: raw.explanation || '',
        sourceArticleId: raw.sourceArticleId || '',
      }));

      if (questions.length === 0) throw new Error('No questions found in the JSON.');

      // Calculate next month
      const today = new Date();
      let nextMonth = today.getMonth() + 2;
      let nextYear = today.getFullYear();
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }

      const newQuiz: Quiz = {
        id: crypto.randomUUID(),
        targetMonth: nextMonth,
        targetYear: nextYear,
        status: 'draft',
        questions: questions,
        createdAt: Date.now(),
        createdBy: user?.uid || 'unknown',
        enrolledUserIds: [], // Admins will select this in the UI
      };

      await academyService.createDraftQuiz(newQuiz);
      toast.success('Successfully imported questions!');
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <Dialog.Title className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Smart Paste Importer
            </Dialog.Title>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 overflow-y-auto custom-thin-scroll flex-1 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Step 1: Copy Prompt Template
                </h4>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-md text-xs font-medium text-slate-600 transition-colors shadow-sm"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Paste this into your external ChatGPT/Gemini chat along with your knowledge base
                CSV. It will instruct the AI to generate a strictly formatted JSON array.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm">Step 2: Paste JSON Result</h4>
              <p className="text-xs text-slate-500">
                Copy the JSON code block that the AI generates and paste it below.
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={'[\n  {\n    "id": "q1",\n    "text": "...",\n    ...\n  }\n]'}
                className="w-full h-64 p-4 text-sm font-mono text-slate-700 bg-slate-900/5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 custom-thin-scroll resize-none"
              />
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isSubmitting || !jsonText.trim()}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? 'Importing...' : 'Import Draft'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
