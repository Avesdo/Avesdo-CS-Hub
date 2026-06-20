import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# For rows, we added title to `<div ... title="...">`. We want:
# `<UITooltip content="..." containerClassName="block"><div ...></div></UITooltip>`

# 1. Action Required (Suspended Projects)
# `<div key={p.id} onClick={...} className="... group" title={`${p.name} - ${clientDisplay || \'Unknown Client\'}`}>`
pat1 = r'(<div key=\{p\.id\} onClick=\{.*?\} className=".*? group") title=(`\$\{p\.name\} - \$\{clientDisplay \|\| \'Unknown Client\'\}`})>'
repl1 = r'<UITooltip content=\2 containerClassName="block">\n                          \1>\n'
# We also need to close it: `</div>` becomes `</div></UITooltip>`
# It's better to just regex the whole block or do it carefully.
