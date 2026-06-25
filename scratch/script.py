import sys
import os

file_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/admin/TemplateDesigner.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* Conditional Logic UI */}' in line:
        start_idx = i
        break

for i in range(start_idx + 1, len(lines)):
    if '        )}' in lines[i]:
        end_idx = i
        break

logic_lines = lines[start_idx:end_idx+1]

func_lines = []
func_lines.append('function renderLogicUI(field: any, index: number, otherFields: any[], handleUpdateField: (idx: number, updates: any) => void) {\n')
func_lines.append('  if (!field.logicEnabled) return null;\n')
func_lines.append('  return (\n')

for line in logic_lines[2:-1]:
    new_line = line
    if "'Show this question'" in new_line:
        new_line = new_line.replace("'Show this question'", "field.type === 'page_break' ? 'Show this page' : 'Show this question'")
    if "'Hide this question'" in new_line:
        new_line = new_line.replace("'Hide this question'", "field.type === 'page_break' ? 'Skip this page' : 'Hide this question'")
    if "'Hide this question' : 'Show this question'" in new_line:
        new_line = new_line.replace("'Hide this question' : 'Show this question'", "(field.type === 'page_break' ? 'Skip this page' : 'Hide this question') : (field.type === 'page_break' ? 'Show this page' : 'Show this question')")
    func_lines.append(new_line)

func_lines.append('  );\n')
func_lines.append('}\n\n')

sortable_idx = -1
for i, line in enumerate(lines):
    if 'function SortableFieldItem(' in line:
        sortable_idx = i
        break

lines = lines[:sortable_idx] + func_lines + lines[sortable_idx:]

start_idx = -1
for i, line in enumerate(lines):
    if '{/* Conditional Logic UI */}' in line and 'function renderLogicUI' not in line:
        start_idx = i
        break

end_idx = -1
for i in range(start_idx + 1, len(lines)):
    if '        )}' in lines[i]:
        end_idx = i
        break

lines[start_idx:end_idx+1] = ['        {renderLogicUI(field, index, otherFields, handleUpdateField)}\n']

pb_start = -1
for i, line in enumerate(lines):
    if "if (field.type === 'page_break')" in line:
        pb_start = i
        break

trash_idx = -1
for i in range(pb_start, len(lines)):
    if 'title="Delete Page Break"' in lines[i]:
        trash_idx = i
        break

logic_toggle = """
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                <input type="checkbox" className="hidden" checked={field.logicEnabled || false} onChange={e => {
                   const enabled = e.target.checked;
                   handleUpdateField(index, { logicEnabled: enabled, dependsOn: enabled ? { fieldId: '', condition: 'equals', value: '' } : null });
                }} />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Logic</span>
            </label>
            <div className="w-px h-5 bg-slate-300 mx-2" />
"""
lines.insert(trash_idx - 1, logic_toggle)

for i, line in enumerate(lines):
    if "if (field.type === 'page_break')" in line:
        pb_start = i
        break

end_pb = -1
for i in range(pb_start, len(lines)):
    if 'Start of Page {pageNumber}' in lines[i]:
        end_pb = i + 2
        break

lines.insert(end_pb, '        <div className="px-8 mt-2">{renderLogicUI(field, index, otherFields, handleUpdateField)}</div>\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
