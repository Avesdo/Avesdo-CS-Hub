import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Extract Project Delivery
proj_start = content.find("          {/* Project Delivery */}")
if proj_start == -1:
    proj_start = content.find("          {/* Project Delivery Hub */}")

client_start = content.find("          {/* Client Health Hub */}")
if client_start == -1:
    client_start = content.find("          {/* Client Health */}")

feature_start = content.find("          {/* Feature Adoption */}")

if proj_start != -1 and client_start != -1 and feature_start != -1:
    project_delivery_html = content[proj_start:client_start]
    client_health_html = content[client_start:feature_start]
    
    new_content = content[:proj_start] + client_health_html + project_delivery_html + content[feature_start:]
    
    with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Widgets swapped successfully")
else:
    print(f"Could not find one of the sections. proj={proj_start}, client={client_start}, feature={feature_start}")
