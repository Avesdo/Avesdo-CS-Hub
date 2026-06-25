import os

files = [
    'PrimaryQAModal.tsx',
    'ClientQAModal.tsx',
    'SecondaryQAModal.tsx',
    'ProjectCertificationModal.tsx',
    'DeliverablesModal.tsx',
    'OnboardingSurveyModal.tsx'
]

base_dir = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals'

for f_name in files:
    f_path = os.path.join(base_dir, f_name)
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()

    form_key = ''
    if f_name == 'PrimaryQAModal.tsx': form_key = 'primaryQA'
    elif f_name == 'ClientQAModal.tsx': form_key = 'clientQA'
    elif f_name == 'SecondaryQAModal.tsx': form_key = 'secondaryQA'
    elif f_name == 'ProjectCertificationModal.tsx': form_key = 'certification'
    elif f_name == 'OnboardingSurveyModal.tsx': form_key = 'survey'
    elif f_name == 'DeliverablesModal.tsx': form_key = 'deliverables'
    
    data_ref_str = f'project?.onboarding?.{form_key}' if form_key != 'deliverables' else 'project?.deliverables'
    
    dates_html = f'''<div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-500">Project: {{project?.name || 'Unknown'}}</p>
              {{({data_ref_str}?.submittedAt || {data_ref_str}?.updatedAt) && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                  {{{data_ref_str}?.submittedAt && <span>Submitted: {{new Date({data_ref_str}.submittedAt).toLocaleDateString('en-US', {{ month: 'short', day: 'numeric', year: 'numeric' }})}}</span>}}
                  {{{data_ref_str}?.updatedAt && {data_ref_str}?.updatedAt !== {data_ref_str}?.submittedAt && <span>Updated: {{new Date({data_ref_str}.updatedAt).toLocaleDateString('en-US', {{ month: 'short', day: 'numeric', year: 'numeric' }})}}</span>}}
                </div>
              )}}
            </div>'''
            
    content = content.replace("<p className=\"text-sm text-slate-500\">Project: {project?.name || 'Unknown'}</p>", dates_html)
    # Deliverables modal has a different tag for project name:
    content = content.replace("<p className=\"text-[13px] text-slate-500 mt-0.5 font-medium\">{project.name}</p>", dates_html)

    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)
