import os

# 1. Update exportUtils.ts
export_utils_path = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/utils/exportUtils.ts'
with open(export_utils_path, 'r', encoding='utf-8') as f:
    export_content = f.read()

# We need to change exportFormToCSV to:
# export const exportFormToCSV = (formName: string, projectData: any, formData: any, template?: any)
# and change logic so fields are rows: Field Name, Response.

new_exportFormToCSV = """export const exportFormToCSV = (formName: string, projectData: any, formData: any, template?: any) => {
  if (!formData || Object.keys(formData).length === 0) {
    toast.error('No Data', 'There is no data to export.');
    return;
  }

  // Build a map of field_id to question title from template
  const idToTitle: Record<string, string> = {};
  if (template && template.pages) {
    template.pages.forEach((page: any) => {
      if (page.sections) {
        page.sections.forEach((sec: any) => {
          if (sec.questions) {
            sec.questions.forEach((q: any) => {
              idToTitle[q.id] = q.title || q.id;
            });
          }
        });
      }
    });
  }

  const keys = Object.keys(formData).filter(k => k !== 'submittedAt' && k !== 'updatedAt');
  
  // Rows: Field Name, Response
  const rows = [];
  rows.push(['Project Name', escapeCSV(projectData?.name || 'Unknown Project')].join(','));
  rows.push(['Form Name', escapeCSV(formName)].join(','));
  rows.push(['Submitted At', escapeCSV(formData.submittedAt ? new Date(formData.submittedAt).toLocaleDateString() : 'N/A')].join(','));
  rows.push(['Updated At', escapeCSV(formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'N/A')].join(','));
  rows.push(''); // blank row
  rows.push(['Question', 'Response'].join(','));
  
  keys.forEach(k => {
    const questionTitle = idToTitle[k] || k;
    rows.push([escapeCSV(questionTitle), escapeCSV(formData[k])].join(','));
  });

  const csvString = rows.join('\\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = `${projectData?.name?.replace(/\\s+/g, '_')}_${formName.replace(/\\s+/g, '_')}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Export Complete', `${filename} has been downloaded.`);
};"""

# Replace exportFormToCSV
export_content = export_content[:export_content.find('export const exportFormToCSV')] + new_exportFormToCSV + "\n\n" + export_content[export_content.find('export const exportAllFormResponsesToCSV'):]

# Now for exportAllFormResponsesToCSV:
# export const exportAllFormResponsesToCSV = (formName: string, formKey: string, projects: any[], isDeliverables = false, template?: any)
new_exportAll = """export const exportAllFormResponsesToCSV = (formName: string, formKey: string, projects: any[], isDeliverables = false, template?: any) => {
  const submissions: { projectName: string; data: any }[] = [];
  projects.forEach(p => {
    const data = isDeliverables ? p.deliverables : p.onboarding?.[formKey];
    // If it's Deliverables, might just check if data exists
    if (data) {
      // For forms, we check if they have keys
      if (Object.keys(data).length > 0) {
        submissions.push({ projectName: p.name, data });
      } else if (isDeliverables) {
        // Even if empty object, if it's assigned we could theoretically export it, but there are no answers.
      }
    }
  });

  if (submissions.length === 0) {
    toast.error('No Data', `No projects have submitted the ${formName} yet.`);
    return;
  }

  const idToTitle: Record<string, string> = {};
  if (template && template.pages) {
    template.pages.forEach((page: any) => {
      if (page.sections) {
        page.sections.forEach((sec: any) => {
          if (sec.questions) {
            sec.questions.forEach((q: any) => {
              idToTitle[q.id] = q.title || q.id;
            });
          }
        });
      }
    });
  }
  // If no template (like deliverables), it's just keys
  if (isDeliverables) {
    // We can map known deliverable keys to nicer names, but we'll just use the keys or titleize them
  }

  const allKeys = new Set<string>();
  submissions.forEach(sub => {
    Object.keys(sub.data).forEach(k => {
      if (k !== 'submittedAt' && k !== 'updatedAt') {
        allKeys.add(k);
      }
    });
  });

  const questionKeys = Array.from(allKeys);
  const headers = ['Project Name', 'Form Name', 'Submitted At', 'Updated At', ...questionKeys.map(k => idToTitle[k] || k)];

  const rows = submissions.map(sub => {
    return [
      escapeCSV(sub.projectName || 'Unknown Project'),
      escapeCSV(formName),
      escapeCSV(sub.data.submittedAt ? new Date(sub.data.submittedAt).toLocaleDateString() : 'N/A'),
      escapeCSV(sub.data.updatedAt ? new Date(sub.data.updatedAt).toLocaleDateString() : 'N/A'),
      ...questionKeys.map(k => escapeCSV(sub.data[k]))
    ].join(',');
  });

  const csvString = [headers.map(escapeCSV).join(','), ...rows].join('\\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `All_${formName.replace(/\\s+/g, '_')}_Responses_${dateStamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Export Complete', `${filename} has been downloaded.`);
};"""

export_content = export_content[:export_content.find('export const exportAllFormResponsesToCSV')] + new_exportAll

with open(export_utils_path, 'w', encoding='utf-8') as f:
    f.write(export_content)
