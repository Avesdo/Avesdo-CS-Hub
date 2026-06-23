import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 bg-slate-50/50 rounded-t-2xl transition-all duration-200 opacity-0 max-h-0 overflow-hidden px-1.5 py-0 border-b-0 group-focus-within/editor:opacity-100 group-focus-within/editor:max-h-[50px] group-focus-within/editor:py-1.5 group-focus-within/editor:border-b group-focus-within/editor:border-border">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('bold') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('italic') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('strike') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors ${editor.isActive('link') ? 'bg-slate-200/50 text-slate-900' : ''}`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      {editor.isActive('link') && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={`p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors`}
          title="Remove Link"
        >
          <Unlink className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const extensions = [
  StarterKit,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline hover:text-primary/80 transition-colors cursor-pointer',
    },
  }),
];

export function RichTextEditor({ content, onChange, placeholder = 'Write an internal note or update...', disabled = false }: RichTextEditorProps) {
  const [localContent, setLocalContent] = useState(content);

  const editor = useEditor({
    extensions,
    content: localContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setLocalContent(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate max-w-none w-full min-h-[80px] px-4 py-3 outline-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:p-0 leading-snug',
      },
    },
  });

  useEffect(() => {
    if (editor && content === '') {
      editor.commands.setContent('');
      setLocalContent('');
    }
  }, [content, editor]);

  return (
    <div className={`flex flex-col w-full bg-transparent group/editor ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <MenuBar editor={editor} />
      <div className="cursor-text min-h-[80px] relative" onClick={() => editor?.chain().focus().run()}>
        {editor && !editor.getText() && !editor.isActive('link') && (
           <div className="absolute left-0 top-0 px-4 py-3 text-sm text-slate-300 pointer-events-none">
             {placeholder}
           </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
