import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

for (const sourceFile of project.getSourceFiles()) {
  const jsxElements = [...sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement), ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)];
  
  for (const jsx of jsxElements) {
    const openingElement = jsx.getKind() === SyntaxKind.JsxElement 
      ? jsx.getOpeningElement() 
      : jsx;
      
    const classNameAttr = openingElement.getAttribute('className');
    if (classNameAttr) {
      const text = classNameAttr.getText();
      if (text.includes('truncate')) {
        if (jsx.getKind() === SyntaxKind.JsxSelfClosingElement) {
           console.log(`Complex (Self Closing): ${sourceFile.getBaseName()}:${jsx.getStartLineNumber()}`);
           console.log(jsx.getText().substring(0, 100));
        } else {
           const children = jsx.getJsxChildren();
           const hasElement = children.some(c => c.getKind() === SyntaxKind.JsxElement || c.getKind() === SyntaxKind.JsxSelfClosingElement);
           if (hasElement) {
               console.log(`Complex (Has Element): ${sourceFile.getBaseName()}:${jsx.getStartLineNumber()}`);
               console.log(jsx.getText().substring(0, 150));
           }
        }
      }
    }
  }
}
