import re

with open("C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def extract_block(start_marker, next_marker=None):
    start_idx = content.find(start_marker)
    if start_idx == -1: raise Exception(f"Start marker not found: {start_marker}")
    
    if next_marker:
        end_idx = content.find(next_marker, start_idx)
        if end_idx == -1: raise Exception(f"Next marker not found: {next_marker}")
        return content[start_idx:end_idx]
    else:
        return content[start_idx:]

health_hub = extract_block("{/* ROW 2: Client Health Hub */}", "{/* ROW 3: Project Delivery Hub */}")
delivery_hub = extract_block("{/* ROW 3: Project Delivery Hub */}", "{/* ROW 4: Features + Workload */}")
features_workload = extract_block("{/* ROW 4: Features + Workload */}", "{/* ROW 5: Recent Activity */}")
recent_activity = extract_block("{/* ROW 5: Recent Activity */}", "    </div>\n  );\n}")

# Strip wrappers
health_hub_inner = re.sub(r'\{\/\* ROW 2: Client Health Hub \*\/\}\n\s*<div className="mb-5 relative z-10 transition-all duration-500 animate-in fade-in duration-700 delay-300 fill-mode-both">\n', '', health_hub)
health_hub_inner = health_hub_inner.rstrip()
if health_hub_inner.endswith('</div>'): health_hub_inner = health_hub_inner[:-6]

delivery_hub_inner = re.sub(r'\{\/\* ROW 3: Project Delivery Hub \*\/\}\n\s*<div className="grid grid-cols-1 gap-5 mb-5 transition-all duration-500 animate-in fade-in duration-700 delay-300 fill-mode-both">\n', '', delivery_hub)
delivery_hub_inner = delivery_hub_inner.rstrip()
if delivery_hub_inner.endswith('</div>'): delivery_hub_inner = delivery_hub_inner[:-6]

features_workload_inner = re.sub(r'\{\/\* ROW 4: Features \+ Workload \*\/\}\n\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 animate-in fade-in duration-700 delay-300 fill-mode-both">\n', '', features_workload)
features_workload_inner = features_workload_inner.rstrip()
if features_workload_inner.endswith('</div>'): features_workload_inner = features_workload_inner[:-6]

split_idx = features_workload_inner.find('<div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden h-full min-h-[250px] max-h-[400px]">')
feature_adoption = features_workload_inner[:split_idx].strip()
manager_workload = features_workload_inner[split_idx:].strip()

feature_adoption = feature_adoption.replace('lg:col-span-2 ', '')

recent_activity_inner = re.sub(r'\{\/\* ROW 5: Recent Activity \*\/\}\n\s*<div className="flex flex-col gap-5 mb-5 animate-in fade-in duration-700 delay-400 fill-mode-both">\n', '', recent_activity)
recent_activity_inner = recent_activity_inner.rstrip()
if recent_activity_inner.endswith('</div>'): recent_activity_inner = recent_activity_inner[:-6]

recent_activity_inner = recent_activity_inner.replace('max-h-[450px]', 'max-h-[800px]')
manager_workload = manager_workload.replace('max-h-[400px]', 'max-h-[600px]')

new_layout = f"""      {{/* MAIN BENTO GRID */}}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 relative z-10 animate-in fade-in duration-700 delay-300 fill-mode-both">
        
        {{/* LEFT COLUMN: Data & Analytics (2/3 Width) */}}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {{/* Project Delivery Hub */}}
          {delivery_hub_inner.strip()}

          {{/* Client Health Hub */}}
          {health_hub_inner.strip()}

          {{/* Feature Adoption */}}
          {feature_adoption.strip()}
        </div>

        {{/* RIGHT COLUMN: People & Activity (1/3 Width) */}}
        <div className="flex flex-col gap-5">
          {{/* Manager Workload */}}
          {manager_workload.strip()}

          {{/* Recent Activity */}}
          {recent_activity_inner.strip()}
        </div>
      </div>
"""

start_replace_idx = content.find("{/* ROW 2: Client Health Hub */}")
end_replace_idx = content.find("    </div>\n  );\n}")

final_content = content[:start_replace_idx] + new_layout + content[end_replace_idx:]

with open("C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(final_content)

print("Dashboard rewritten successfully!")