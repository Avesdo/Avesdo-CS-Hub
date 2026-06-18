import os
import re

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
    
    if 'exportFormToCSV' not in content:
        content = content.replace("import { DynamicForm } from '../ui/DynamicForm';", "import { DynamicForm } from '../ui/DynamicForm';\nimport { exportFormToCSV } from '../../utils/exportUtils';")
    if 'FileText' not in content:
        content = content.replace("import { X } from 'lucide-react';", "import { X, FileText } from 'lucide-react';")
    
    form_key_match = re.search(r'([a-zA-Z]+): data,', content)
    if form_key_match:
        form_key = form_key_match.group(1)
        
        replacement_handle_save = f'''const now = new Date().toISOString();
      const updatedOnboarding = {{
        ...project.onboarding,
        {form_key}: {{
          ...data,
          submittedAt: project.onboarding?.{form_key}?.submittedAt || now,
          updatedAt: now
        }},
      }};'''
        
        content = re.sub(
            r'const updatedOnboarding = \{\s*\.\.\.project\.onboarding,\s*[a-zA-Z]+: data,\s*\};',
            replacement_handle_save,
            content
        )
    
        header_pattern = r'(<div className="flex items-center gap-3">\s*)(<button\s*onClick=\{onClose\})'
        
        title_match = re.search(r'<h2 className="text-xl font-bold text-slate-900">([^<]+)</h2>', content)
        title = title_match.group(1) if title_match else 'Form'
        
        button_html = f'''{{project?.onboarding?.{form_key} && Object.keys(project.onboarding.{form_key}).length > 0 && (
              <button
                onClick={{() => exportFormToCSV('{title}', project, project.onboarding.{form_key})}}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm mr-2"
              >
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
            )}}
            \\2'''
                
        content = re.sub(header_pattern, button_html, content)
        
        btn_text = 'Update Response' if 'QA' not in title else ('Update QA' if 'Client' not in title else 'Update Response')
        if 'submitLabel=' in content:
            content = re.sub(
                r'submitLabel="[^"]+"',
                f'submitText={{project?.onboarding?.{form_key} && Object.keys(project.onboarding.{form_key}).length > 0 ? "{btn_text}" : "Submit"}}',
                content
            )
        else:
            content = re.sub(
                r'onCancel=\{onClose\}\s*/>',
                f'onCancel={{onClose}}\n                  submitText={{project?.onboarding?.{form_key} && Object.keys(project.onboarding.{form_key}).length > 0 ? "{btn_text}" : "Submit"}}\n                />',
                content
            )

        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(content)
