const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destFile = path.join(srcDir, 'public', 'index.html');

console.log('Starting build compilation...');

try {
  let indexContent = fs.readFileSync(path.join(srcDir, 'Index.html'), 'utf8');

  // Match: <?!= include('Filename'); ?>
  const regex = /<\?[\s\S]*?include\(['"]([^'"]+)['"]\);?[\s\S]*?\?>/g;

  let match;
  let compiled = indexContent;

  // Let's replace the includes recursively or iteratively
  while ((match = regex.exec(indexContent)) !== null) {
    const placeholder = match[0];
    const filename = match[1];

    let filepath = path.join(srcDir, filename + '.html');
    if (!fs.existsSync(filepath)) {
      filepath = path.join(srcDir, filename + '.js');
    }
    if (!fs.existsSync(filepath)) {
      filepath = path.join(srcDir, filename + '.css');
    }

    if (fs.existsSync(filepath)) {
      console.log(`Including file: ${filename}`);
      let fileContent = fs.readFileSync(filepath, 'utf8');
      
      // If we are replacing the template, make sure to clean wrapping tags if desired,
      // but standard practice is to keep the file content as is.
      compiled = compiled.replace(placeholder, () => fileContent);
    } else {
      console.warn(`Warning: File not found for include: ${filename}`);
      compiled = compiled.replace(placeholder, () => `<!-- Include missing: ${filename} -->`);
    }
  }

  // Ensure public folder exists
  const publicDir = path.dirname(destFile);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(destFile, compiled, 'utf8');
  console.log(`Compilation successful! Saved to ${destFile}`);

} catch (err) {
  console.error('Error compiling:', err);
  process.exit(1);
}
