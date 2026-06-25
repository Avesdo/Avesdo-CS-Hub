import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Action Required (Suspended Projects)
# Add title to the group div
pat1 = r'(<div key=\{p\.id\} onClick=\{.*?\} className=".*? group")>'
repl1 = r'\1 title={`${p.name} - ${clientDisplay || \'Unknown Client\'}`}>'
content = re.sub(pat1, repl1, content)

# 2. Action Required (At Risk)
pat2 = r'(<div key=\{c\.clientId\} onClick=\{.*?\} className=".*? group")>'
repl2 = r'\1 title={c.companyName}>'
content = re.sub(pat2, repl2, content)

# 3. Top Improvers / At Risk (Dropping)
pat3 = r'(<div key=\{m\.id\} onClick=\{.*?\} className=".*? group")>'
repl3 = r'\1 title={m.name}>'
content = re.sub(pat3, repl3, content)

# 4. Feature Adoption
# The row wrapper is `<div key={feature} className="... group">`
pat4 = r'(<div\s*key=\{feature\}\s*className="[^"]*group[^"]*")>'
repl4 = r'\1 title={feature}>'
content = re.sub(pat4, repl4, content)

# 5. Recent Activity / Upcoming Launches
pat5 = r'(<div\s*className="flex-1 bg-white[^"]*overflow-hidden"\s*onClick=\{.*?\}\s*)>'
repl5 = r'\1 title={`${act.title} - ${isService ? act.projectName + " - " + act.clientName : act.clientName}`}>\n'
content = re.sub(pat5, repl5, content)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Row titles added.")