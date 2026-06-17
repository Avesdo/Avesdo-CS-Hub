import re

with open('src/components/GlobalSearch.tsx', 'r') as f:
    content = f.read()

# Add ref
content = content.replace(
    'const containerRef = useRef<HTMLDivElement>(null);',
    '''const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);'''
)

# Add ref to input
content = content.replace(
    '''<input
        type="text"
        role="combobox"''',
    '''<input
        ref={inputRef}
        type="text"
        role="combobox"'''
)

# Add (Cmd+K) hint
content = content.replace(
    'placeholder="Search clients, projects, or services..."',
    'placeholder="Search clients, projects, or services... (Cmd+K)"'
)

with open('src/components/GlobalSearch.tsx', 'w') as f:
    f.write(content)

print("Done")
