import os
import re

directory = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals'
modals = ['OnboardingSurveyModal.tsx', 'PrimaryQAModal.tsx', 'ClientQAModal.tsx', 'SecondaryQAModal.tsx', 'ProjectCertificationModal.tsx']

for filename in modals:
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Edit2 to lucide-react imports if not there
    if 'Edit2' not in content and 'lucide-react' in content:
        content = re.sub(r'(import \{[^}]*)\}( from \'lucide-react\';)', r'\1, Edit2\2', content)

    # Add isEditing state after isSaving state
    if 'const [isEditing, setIsEditing] = useState(false);' not in content:
        content = content.replace('const [isSaving, setIsSaving] = useState(false);', 
                                  'const [isSaving, setIsSaving] = useState(false);\n  const [isEditing, setIsEditing] = useState(false);')

    # Add Edit Form button before Download CSV button or close button
    edit_btn = """
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Form
              </button>
            )}
"""
    if 'Edit Form' not in content:
        # Find the <div className="flex items-center gap-3"> block which contains the buttons
        # we can just prepend it before the Download CSV block, or before the close button
        content = re.sub(
            r'(<div className="flex items-center gap-3">)',
            r'\1' + edit_btn,
            content
        )

    # Add readOnly={!isEditing} to DynamicForm
    if 'readOnly={!isEditing}' not in content:
        content = re.sub(
            r'(<DynamicForm\s+template=\{template\})',
            r'\1 \n                  readOnly={!isEditing}',
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {filename}')
