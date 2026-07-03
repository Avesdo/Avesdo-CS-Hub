import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

let modifiedFiles = 0;

for (const sourceFile of project.getSourceFiles()) {
  let fileModified = false;
  
  const jsxElements = [...sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)];
  
  for (const jsx of jsxElements) {
    if (jsx.wasForgotten()) continue;
    
    const openingElement = jsx.getOpeningElement();
    const classNameAttr = openingElement.getAttribute('className');
    
    if (classNameAttr) {
      const text = classNameAttr.getText();
      if (text.includes('truncate')) {
        const children = jsx.getJsxChildren();
        const hasElement = children.some(c => c.getKind() === SyntaxKind.JsxElement || c.getKind() === SyntaxKind.JsxSelfClosingElement);
        
        if (!hasElement) {
          // Simple text truncate!
          
          // 1. Get the original classes without 'truncate'
          let newClassName = text.replace(/\btruncate\b/g, '').replace(/\s+/g, ' ').replace(/"/g, '').replace(/'/g, '').replace(/^{/, '').replace(/}$/, '').trim();
          if (newClassName.startsWith('`') && newClassName.endsWith('`')) {
              newClassName = newClassName.slice(1, -1).trim();
          }
          if (newClassName.startsWith('className=')) {
              newClassName = newClassName.replace('className=', '').trim();
          }

          // 2. Determine text prop value. 
          // If children is a single JsxExpression, we can just use that expression.
          let textProp = '';
          const innerText = children.map(c => c.getText()).join('').trim();
          
          if (children.length === 1 && children[0].getKind() === SyntaxKind.JsxExpression) {
            const expr = children[0].getExpression();
            textProp = expr ? `{${expr.getText()}}` : `"${innerText}"`;
          } else {
             // It's a mix of text and expressions, we can wrap it in template literal or just use a string.
             // We can use String(...)
             textProp = `{String(${children.map(c => c.getKind() === SyntaxKind.JsxText ? JSON.stringify(c.getText().trim()) : (c.getKind() === SyntaxKind.JsxExpression ? (c.getExpression() ? c.getExpression().getText() : "''") : "''")).filter(Boolean).join(' + ')})}`;
          }

          // 3. Construct new JSX
          const containerClassNameProp = newClassName ? ` containerClassName="${newClassName}"` : '';
          const replacement = `<TruncatedText text=${textProp}${containerClassNameProp}>${innerText}</TruncatedText>`;
          
          jsx.replaceWithText(replacement);
          fileModified = true;
        }
      }
    }
  }
  
  if (fileModified) {
    // Add import if needed
    const imports = sourceFile.getImportDeclarations();
    const hasImport = imports.some(i => i.getModuleSpecifierValue().includes('TruncatedText'));
    if (!hasImport) {
        // Find relative path to TruncatedText
        const filePath = sourceFile.getFilePath();
        // Since we know all files are in src, we can just use relative path calculation if we want,
        // or just use a fixed import path if we have an alias? Avesdo_CS_Hub doesn't seem to use absolute aliases like @/components.
        // Let's use relative path.
        const pathSegments = filePath.split('src/')[1].split('/');
        const depth = pathSegments.length - 1;
        const relativePrefix = depth === 0 ? './' : '../'.repeat(depth);
        const importPath = `${relativePrefix}components/ui/TruncatedText`;
        
        sourceFile.addImportDeclaration({
            namedImports: ['TruncatedText'],
            moduleSpecifier: importPath,
        });
    }
    
    sourceFile.saveSync();
    modifiedFiles++;
    console.log(`Modified ${sourceFile.getBaseName()}`);
  }
}

console.log(`Successfully modified ${modifiedFiles} files.`);
