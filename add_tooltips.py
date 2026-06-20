import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (r'<span className="truncate text-foreground font-bold">{managerFilter}</span>',
     r'<span className="truncate text-foreground font-bold" title={managerFilter}>{managerFilter}</span>'),
    
    (r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-amber-600 transition-colors truncate">{p\.name}</span>',
     r'<span className="text-[13px] font-bold text-foreground group-hover:text-amber-600 transition-colors truncate" title={p.name}>{p.name}</span>'),
    
    (r'<span className="text-\[11px\] font-semibold text-muted-foreground truncate">{clientDisplay \|\| \'Unknown Client\'}</span>',
     r'<span className="text-[11px] font-semibold text-muted-foreground truncate" title={clientDisplay || \'Unknown Client\'}>{clientDisplay || \'Unknown Client\'}</span>'),
    
    (r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-red-600 transition-colors truncate">{c\.companyName}</span>',
     r'<span className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors truncate" title={c.companyName}>{c.companyName}</span>'),
    
    (r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-lime-600 transition-colors truncate">{m\.name}</span>',
     r'<span className="text-[13px] font-bold text-foreground group-hover:text-lime-600 transition-colors truncate" title={m.name}>{m.name}</span>'),
    
    (r'<span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">\s*{feature}\s*</span>',
     r'<span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors" title={feature}>\n                          {feature}\n                        </span>'),
    
    (r'<span className="text-sm font-bold text-foreground truncate">{manager}</span>',
     r'<span className="text-sm font-bold text-foreground truncate" title={manager}>{manager}</span>'),
    
    (r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-primary transition-colors truncate">{act\.title}</span>',
     r'<span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate" title={act.title}>{act.title}</span>'),
     
    (r'<span className="text-\[11px\] text-muted-foreground font-medium mt-0\.5 truncate">\s*{act\.projectName} &bull; {act\.clientName}\s*</span>',
     r'<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate" title={`${act.projectName} • ${act.clientName}`}>\n                                {act.projectName} &bull; {act.clientName}\n                              </span>'),
    
    (r'<span className="text-\[11px\] text-muted-foreground font-medium mt-0\.5 truncate">\s*{act\.clientName}\s*</span>',
     r'<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate" title={act.clientName}>\n                                {act.clientName}\n                              </span>'),
     
    (r'<div className="text-base font-semibold tracking-tight text-foreground truncate">\s*Feature Adoption\s*</div>',
     r'<div className="text-base font-semibold tracking-tight text-foreground truncate" title="Feature Adoption">\n                Feature Adoption\n              </div>'),
     
    (r'<p className="text-xs text-muted-foreground mt-1 font-medium truncate">\s*Combined adoption across {featureAdoptionCombined\.totalProjects} total projects\s*</p>',
     r'<p className="text-xs text-muted-foreground mt-1 font-medium truncate" title={`Combined adoption across ${featureAdoptionCombined.totalProjects} total projects`}>\n                Combined adoption across {featureAdoptionCombined.totalProjects} total projects\n              </p>')
]

for pat, repl in replacements:
    content = re.sub(pat, repl, content)

# A few specific replacements for the right column widgets which have different indentation
# act.projectName
content = re.sub(r'<span className="text-\[11px\] text-muted-foreground font-medium mt-0\.5 truncate" title={`\$\{act.projectName\} • \$\{act.clientName\}`}>\n                                \{act.projectName\} &bull; \{act.clientName\}\n                              </span>',
                 r'<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate" title={`${act.projectName} • ${act.clientName}`}>\n                                {act.projectName} &bull; {act.clientName}\n                              </span>', content)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Tooltips added.")
