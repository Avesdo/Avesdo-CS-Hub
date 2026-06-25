import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Extract blocks
manager_start = content.find("          {/* Manager Workload */}")
recent_start = content.find("          {/* Recent Activity */}")
upcoming_start = content.find("          {/* Upcoming Launches */}")
end_idx = content.find("        </div>\n        </div>\n      </div>")

manager_block = content[manager_start:recent_start]
recent_block = content[recent_start:upcoming_start]
upcoming_block = content[upcoming_start:end_idx]

# Write new order: Manager Workload -> Upcoming Launches -> Recent Activity
new_content = content[:manager_start] + manager_block + upcoming_block + recent_block + content[end_idx:]

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Reordered successfully!")
