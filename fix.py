import os

files = [
    'PrimaryQAModal.tsx',
    'ClientQAModal.tsx',
    'SecondaryQAModal.tsx',
    'ProjectCertificationModal.tsx'
]

base_dir = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals'

for f_name in files:
    f_path = os.path.join(base_dir, f_name)
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to find the place where the button was inserted and add the <div className="flex items-center gap-3"> before it
    # We can just look for the header closing div and the button
    
    if "className=\"flex items-center gap-3\"" not in content:
        # It's missing!
        # The line before it is:
        # <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
        #           </div>
        content = content.replace("</p>\n          </div>\n          {project", "</p>\n          </div>\n          <div className=\"flex items-center gap-3\">\n            {project")
        
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)
