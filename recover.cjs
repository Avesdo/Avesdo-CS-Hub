  const fs = require('fs');
  const readline = require('readline');
  const path = require('path');

  const brainDir = 'C:/Users/roell/.gemini/antigravity/brain';
  const outDir = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/recovery';
  
async function recover() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const fileStates = {}; // targetFile -> content

  const dirs = fs.readdirSync(brainDir);
  // Sort dirs by creation/modification time so we process older transcripts first
  const sortedDirs = dirs.map(d => path.join(brainDir, d)).filter(p => fs.statSync(p).isDirectory()).sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);

  for (const dir of sortedDirs) {
    const logPath = path.join(dir, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(logPath)) continue;

    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line) continue;
      try {
        const entry = JSON.parse(line);
        // We only care about events up to June 6, 2026
        if (entry.created_at && entry.created_at > '2026-06-06T06:00:00Z') {
          continue;
        }
      
      if (entry.source === 'MODEL' && entry.tool_calls) {
        for (const call of entry.tool_calls) {
          const rawArgs = call.args || call.arguments;
          let args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
          if (args && typeof args === 'object') {
            for (const key in args) {
              if (typeof args[key] === 'string') {
                try { args[key] = JSON.parse(args[key]); } catch (e) {}
              }
            }
          }
          if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
            console.log(`Found ${call.name} at ${entry.created_at}`);
          }
          if (call.name === 'write_to_file') {
            if (args.TargetFile && args.CodeContent) {
              fileStates[args.TargetFile] = args.CodeContent;
            }
          } else if (call.name === 'replace_file_content') {
            if (args.TargetFile && fileStates[args.TargetFile]) {
              const lines = fileStates[args.TargetFile].split('\n');
              const start = args.StartLine - 1;
              const end = args.EndLine;
              // replace lines start..end with replacementContent
              const newLines = args.ReplacementContent.split('\n');
              lines.splice(start, end - start, ...newLines);
              fileStates[args.TargetFile] = lines.join('\n');
            }
          } else if (call.name === 'multi_replace_file_content') {
            if (args.TargetFile && fileStates[args.TargetFile]) {
              let content = fileStates[args.TargetFile];
              // sort chunks by startLine descending so we don't mess up indices
              const chunks = [...args.ReplacementChunks].sort((a, b) => b.StartLine - a.StartLine);
              for (const chunk of chunks) {
                const lines = content.split('\n');
                const start = chunk.StartLine - 1;
                const end = chunk.EndLine;
                const newLines = chunk.ReplacementContent.split('\n');
                lines.splice(start, end - start, ...newLines);
                content = lines.join('\n');
              }
              fileStates[args.TargetFile] = content;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error on line:', line, e);
    }
  }

  // Write out the recovered files
  for (const [path, content] of Object.entries(fileStates)) {
    // Only recover src and tests
    if (path.includes('Avesdo_CS_Hub\\src') || path.includes('Avesdo_CS_Hub/src') || 
        path.includes('Avesdo_CS_Hub\\tests') || path.includes('Avesdo_CS_Hub/tests')) {
      const relPath = path.replace(/\\/g, '/').split('Avesdo_CS_Hub/')[1];
      if (relPath) {
        const dest = `${outDir}/${relPath}`;
        const dir = dest.substring(0, dest.lastIndexOf('/'));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dest, content);
        console.log(`Recovered ${relPath}`);
      }
    }
  }
}

recover().catch(console.error);

}
recover().catch(console.error);
