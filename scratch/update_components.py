import os
import re

# 1. Update AdminHub.tsx
admin_hub_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/AdminHub.tsx'
with open(admin_hub_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

# We need to find the template for each form and pass it to exportAllFormResponsesToCSV
# AdminHub has `settings = useAppStore(state => state.settings);`
# Let's add a helper inside AdminHub to get a template by form name.
# Or we can just pass the template when we call the export function.

# Wait, the buttons in AdminHub look like this:
# <button onClick={() => exportAllFormResponsesToCSV('Onboarding Survey', 'survey', projects)}>

# Let's insert a helper function right after `const { getFilteredProjects } = useProjects();`
helper_code = """
  const getTemplate = (formName: string) => {
    const templateId = Object.keys(settings?.templates || {}).find(k => settings.templates[k].name === formName || settings.templates[k].type === 'form');
    return templateId ? settings.templates[templateId] : null;
  };
"""

if "const getTemplate =" not in admin_content:
    # Find `const { getFilteredProjects } = useProjects();`
    admin_content = admin_content.replace('const { getFilteredProjects } = useProjects();', 'const { getFilteredProjects } = useProjects();\n' + helper_code)

# Now replace the calls
admin_content = admin_content.replace(
    "onClick={() => exportAllFormResponsesToCSV('Onboarding Survey', 'survey', projects)}",
    "onClick={() => exportAllFormResponsesToCSV('Onboarding Survey', 'survey', projects, false, getTemplate('Onboarding Survey'))}"
)
admin_content = admin_content.replace(
    "onClick={() => exportAllFormResponsesToCSV('Primary QA', 'primaryQA', projects)}",
    "onClick={() => exportAllFormResponsesToCSV('Primary QA', 'primaryQA', projects, false, getTemplate('Primary QA'))}"
)
admin_content = admin_content.replace(
    "onClick={() => exportAllFormResponsesToCSV('Client QA', 'clientQA', projects)}",
    "onClick={() => exportAllFormResponsesToCSV('Client QA', 'clientQA', projects, false, getTemplate('Client QA'))}"
)
admin_content = admin_content.replace(
    "onClick={() => exportAllFormResponsesToCSV('Secondary QA', 'secondaryQA', projects)}",
    "onClick={() => exportAllFormResponsesToCSV('Secondary QA', 'secondaryQA', projects, false, getTemplate('Secondary QA'))}"
)
admin_content = admin_content.replace(
    "onClick={() => exportAllFormResponsesToCSV('Project Certification', 'certification', projects)}",
    "onClick={() => exportAllFormResponsesToCSV('Project Certification', 'certification', projects, false, getTemplate('Project Certification'))}"
)

with open(admin_hub_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)

# 2. Update Modals
modals = [
    ('PrimaryQAModal.tsx', 'Primary QA'),
    ('ClientQAModal.tsx', 'Client QA'),
    ('SecondaryQAModal.tsx', 'Secondary QA'),
    ('ProjectCertificationModal.tsx', 'Project Certification'),
    ('OnboardingSurveyModal.tsx', 'Onboarding Survey')
]

for f_name, form_name in modals:
    f_path = f'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals/{f_name}'
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # exportFormToCSV('Client QA', project, project.onboarding.clientQA)
    # The modal already has `const template = ...`
    # We just need to add `, template` to the end.
    
    content = re.sub(r"(exportFormToCSV\([^,]+,\s*project,\s*project\.onboarding\.[a-zA-Z0-9_]+\))", r"\1, template", content)
    
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)

# For DeliverablesModal, we need to move the button from footer to header and remove Object.keys length condition.
deliverables_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals/DeliverablesModal.tsx'
with open(deliverables_path, 'r', encoding='utf-8') as f:
    d_content = f.read()

# We can just remove it from footer entirely:
d_content = d_content.replace("""<div>
            {Object.keys(deliverablesState).length > 0 && (
              <button
                onClick={() => exportFormToCSV('Deliverables Checklist', project, deliverablesState)}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
            )}
          </div>""", "<div></div>")

# And add it to header:
header_button = """{project?.deliverables && Object.keys(project.deliverables).length > 0 && (
              <button
                onClick={() => exportFormToCSV('Deliverables Checklist', project, deliverablesState)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm mr-2"
              >
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
            )}"""

d_content = d_content.replace("""<button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >""", header_button + """
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >""")

with open(deliverables_path, 'w', encoding='utf-8') as f:
    f.write(d_content)

