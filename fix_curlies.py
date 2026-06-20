import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix text={{...}} to text={...}
# But wait, some might be text={feature} if they didn't have curly braces originally?
# Let's see: `{{p.name}}`
content = re.sub(r'text=\{\{([^}]+)\}\}', r'text={\1}', content)

# But what about `<TruncatedText text={{clientDisplay || 'Unknown Client'}}` ?
# That is also `{{...}}`. 
content = re.sub(r'text=\{\{(.*?)\}\}', r'text={\1}', content)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed double curly braces.")
