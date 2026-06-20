import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the `<UITooltip content={...} containerClassName="block w-full">` wrapping the rows
# The regex can match `<UITooltip[^>]*containerClassName="block w-full">\s*(.*?)\s*</UITooltip>` but wait! `(.*?)` is dangerous if there are nested UITooltips.
# We know the specific rows. Let's just strip `<UITooltip ... containerClassName="block w-full">` and `</UITooltip>` from the whole file. 
# Oh wait, `content="..."` is dynamic.
content = re.sub(r'<UITooltip[^>]*containerClassName="block w-full">\s*(.*?)\s*</UITooltip>', r'\1', content, flags=re.DOTALL)

# Let's verify if that's safe. Yes, we only used `containerClassName="block w-full"` for these wrappers.

# Now we need to replace the `<span>` tags that contain the text with `TruncatedText` component.
# First, ensure TruncatedText is imported.
if "TruncatedText" not in content:
    content = content.replace("import { Tooltip as UITooltip } from '../components/ui/Tooltip';", 
                              "import { Tooltip as UITooltip } from '../components/ui/Tooltip';\nimport { TruncatedText } from '../components/ui/TruncatedText';")

# 2. Project Name in Suspended
# `<span className="text-[13px] font-bold text-foreground group-hover:text-amber-600 transition-colors truncate">{p.name}</span>`
# -> `<TruncatedText text={p.name} className="text-[13px] font-bold text-foreground group-hover:text-amber-600 transition-colors" />`
content = re.sub(
    r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-amber-600 transition-colors truncate">(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[13px] font-bold text-foreground group-hover:text-amber-600 transition-colors" />',
    content
)

# 3. Client Name in Suspended
# `<span className="text-[11px] font-semibold text-muted-foreground truncate">{clientDisplay || 'Unknown Client'}</span>`
content = re.sub(
    r'<span className="text-\[11px\] font-semibold text-muted-foreground truncate">(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[11px] font-semibold text-muted-foreground" />',
    content
)

# 4. Client Name in At Risk
# `<span className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors truncate">{c.companyName}</span>`
content = re.sub(
    r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-red-600 transition-colors truncate">(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors" />',
    content
)

# 5. Client Name in Top Improvers
# `<span className="text-[13px] font-bold text-foreground group-hover:text-lime-600 transition-colors truncate">{m.name}</span>`
content = re.sub(
    r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-lime-600 transition-colors truncate">(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[13px] font-bold text-foreground group-hover:text-lime-600 transition-colors" />',
    content
)

# 6. Feature Adoption Name
# `<span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors" title={feature}>{feature}</span>`
content = re.sub(
    r'<span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors".*?>(.*?)</span>',
    r'<TruncatedText text={\1} className="text-sm font-bold text-foreground group-hover:text-primary transition-colors" />',
    content
)

# 7. Recent Activity / Upcoming Title
# `<span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate" title={act.title}>{act.title}</span>`
# `<span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">{act.title}</span>`
content = re.sub(
    r'<span className="text-\[13px\] font-bold text-foreground group-hover:text-primary transition-colors truncate".*?>(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors" />',
    content
)

# 8. Recent Activity / Upcoming Client
# `<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate" title={`${act.projectName} \u2022 ${act.clientName}`}>{...}</span>`
# `<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate" title={act.clientName}>{...}</span>`
# Let's just catch `<span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate".*?>(.*?)</span>`
# But wait, in JSX the children might be JS expressions like `{`${act.projectName} • ${act.clientName}`}`.
# Using regex `>` to `</span>` might match the expression.
content = re.sub(
    r'<span className="text-\[11px\] text-muted-foreground font-medium mt-0.5 truncate".*?>(.*?)</span>',
    r'<TruncatedText text={\1} className="text-[11px] text-muted-foreground font-medium mt-0.5" />',
    content
)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Reverted to TruncatedText.")
