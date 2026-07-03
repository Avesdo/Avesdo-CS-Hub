import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

let plainTextCount = 0;
let complexCount = 0;
let totalFiles = 0;

for (const sourceFile of project.getSourceFiles()) {
  let fileHasTruncate = false;
  
  const jsxElements = [...sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement), ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)];
  
  for (const jsx of jsxElements) {
    const openingElement = jsx.getKind() === SyntaxKind.JsxElement 
      ? jsx.getOpeningElement() 
      : jsx;
      
    const classNameAttr = openingElement.getAttribute('className');
    if (classNameAttr) {
      const text = classNameAttr.getText();
      if (text.includes('truncate')) {
        fileHasTruncate = true;
        
        if (jsx.getKind() === SyntaxKind.JsxSelfClosingElement) {
           complexCount++;
        } else {
           const children = jsx.getJsxChildren();
           // if all children are JsxText or JsxExpression that return strings/numbers, it's plain text.
           // for simplicity, if it contains JsxElement, we count as complex
           const hasElement = children.some(c => c.getKind() === SyntaxKind.JsxElement || c.getKind() === SyntaxKind.JsxSelfClosingElement);
           if (hasElement) complexCount++;
           else plainTextCount++;
        }
      }
    }
  }
  
  if (fileHasTruncate) totalFiles++;
}

console.log(`Files to modify: ${totalFiles}`);
console.log(`Plain text truncates: ${plainTextCount}`);
console.log(`Complex truncates: ${complexCount}`);
