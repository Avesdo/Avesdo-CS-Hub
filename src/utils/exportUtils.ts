import { toast } from './toast';

export const escapeCSV = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) value = value.join(', ');

  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const mapClientRow = (c: any) =>
  [
    escapeCSV(c.companyName || 'Unnamed Client'),
    escapeCSV(c.clientType),
    escapeCSV(c.healthScore),
    escapeCSV(c.activeProjectsCount ?? 0),
    escapeCSV(c.onboardingProjectsCount ?? 0),
    escapeCSV(c.closedProjectsCount ?? 0),
    escapeCSV(c.accountManager),
  ].join(',');

const mapProjectRow = (p: any) =>
  [
    escapeCSV(p.name || 'Unnamed Project'),
    escapeCSV(p.clients),
    escapeCSV(p.score || p.healthScore),
    escapeCSV(p.releaseDateStr || 'No Date'),
    escapeCSV(p.assignee || p.manager),
    escapeCSV(p.projectStatus || p.status),
    escapeCSV(p.timelineStatus || 'Unassigned'),
    escapeCSV(p.onboardingPhase || 'Unassigned'),
    escapeCSV(p.units ?? 0),
    escapeCSV(p.features && p.features.length > 0 ? p.features.join('; ') : 'Unassigned'),
    escapeCSV(p.checklistUrl || ''),
  ].join(',');

const mapServiceRow = (s: any) =>
  [
    escapeCSV(s.name || 'Unnamed Service'),
    escapeCSV(s.projectName || s.project),
    escapeCSV(s.type),
    escapeCSV(s.clientName || s.clients || s.client),
    escapeCSV(s.managers && s.managers.length ? s.managers : s.manager),
    escapeCSV(s.price ?? 0),
    escapeCSV(s.serviceValue ?? 0),
    escapeCSV(s.outcome),
    escapeCSV(s.status),
    escapeCSV(s.dateStr || 'No Date'),
    escapeCSV(s.invoiceSent ? 'Yes' : 'No'),
    escapeCSV(s.invoiceNum || ''),
    escapeCSV(s.invoicePaid ? 'Yes' : 'No'),
    escapeCSV(s.commission ?? 0),
    escapeCSV(s.commPaid ? 'Yes' : 'No'),
    escapeCSV(s.commDateStr || 'No Date'),
    escapeCSV(s.contactName || ''),
  ].join(',');

export const universalExportCSV = (
  entityType: 'Clients' | 'Projects' | 'Services',
  data: any[],
  filenamePrefix: string
) => {
  toast.info('Preparing export...', `Processing ${data.length} records.`);

  if (!data || data.length === 0) {
    toast.error('No data to export', 'The selected dataset is empty.');
    return;
  }

  let headers: string[] = [];
  let csvRows: string[] = [];

  if (entityType === 'Clients') {
    headers = [
      'Client Name',
      'Client Type',
      'Health Score',
      'Active Projects',
      'Onboarding Projects',
      'Closed Projects',
      'Manager',
    ];
    csvRows = data.map(mapClientRow);
  } else if (entityType === 'Projects') {
    headers = [
      'Project Name',
      'Client(s)',
      'Health Score',
      'Release Date',
      'Manager',
      'Project Status',
      'Schedule Status',
      'Implementation Status',
      'Live Units',
      'Active Features',
      'Deliverables Checklist',
    ];
    csvRows = data.map(mapProjectRow);
  } else if (entityType === 'Services') {
    headers = [
      'Service Name',
      'Project Name',
      'Service Type',
      'Client Name',
      'Manager',
      'Invoice Value',
      'Service Value',
      'Outcome',
      'Fulfillment Status',
      'Date',
      'Invoice Sent',
      'Invoice Number',
      'Invoice Paid',
      'Commission Value',
      'Commission Paid',
      'Date Paid',
      'Client Contact Name',
    ];
    csvRows = data.map(mapServiceRow);
  }

  const csvString = [headers.map((h) => escapeCSV(h)).join(','), ...csvRows].join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_Export_${dateStamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Export Complete', `${filename} has been downloaded`);
};

export const exportFormToCSV = (formName: string, projectData: any, formData: any, template?: any) => {
  const dataToExport = formData || {};
  let keys: string[] = [];
  const idToTitle: Record<string, string> = {};

  if (template?.type === 'checklist' && template.sections) {
    template.sections.forEach((sec: any) => {
      if (sec.items) {
        sec.items.forEach((item: any) => {
          keys.push(item.id);
          idToTitle[item.id] = item.taskName || item.id;
        });
      }
    });
  } else if (template?.fields) {
    template.fields.forEach((field: any) => {
      if (field.type !== 'page_break' && field.type !== 'header') {
        keys.push(field.id);
        idToTitle[field.id] = field.label || field.id;
      }
    });
  } else {
    keys = Object.keys(dataToExport).filter(k => k !== 'submittedAt' && k !== 'updatedAt');
  }

  if (keys.length === 0) {
    toast.error('No Data', 'There is no data to export.');
    return;
  }
  
  const isChecklist = template?.type === 'checklist';

  // Rows output
  const rows = [];
  rows.push(['Project Name', escapeCSV(projectData?.name || 'Unknown Project')].join(','));
  rows.push(['Submitted At', escapeCSV(dataToExport.submittedAt ? new Date(dataToExport.submittedAt).toLocaleDateString() : 'N/A')].join(','));
  rows.push(['Updated At', escapeCSV(dataToExport.updatedAt ? new Date(dataToExport.updatedAt).toLocaleDateString() : 'N/A')].join(','));
  rows.push(''); // blank row
  
  if (isChecklist) {
    // Deliverables format
    rows.push(['Deliverable', 'Status', 'Priority', 'Assigned To', 'Date', 'Client Note', 'Internal Note'].join(','));
    
    // Add template items
    keys.forEach(k => {
      const taskName = idToTitle[k] || k;
      const val = dataToExport[k] || {};
      rows.push([
        escapeCSV(taskName),
        escapeCSV(val.status || 'Pending'),
        escapeCSV(val.priority || 'Normal'),
        escapeCSV(val.resource || ''),
        escapeCSV(val.date ? new Date(val.date).toLocaleDateString() : ''),
        escapeCSV(val.clientNote || ''),
        escapeCSV(val.internalNote || '')
      ].join(','));
    });

    // Add custom items if they exist
    if (dataToExport._customItems && Array.isArray(dataToExport._customItems)) {
      dataToExport._customItems.forEach((custom: any) => {
        rows.push([
          escapeCSV(custom.taskName || 'Custom Item'),
          escapeCSV(custom.status || 'Pending'),
          escapeCSV(custom.priority || 'Normal'),
          escapeCSV(custom.resource || ''),
          escapeCSV(custom.date ? new Date(custom.date).toLocaleDateString() : ''),
          escapeCSV(custom.clientNote || ''),
          escapeCSV(custom.internalNote || '')
        ].join(','));
      });
    }

  } else {
    // Standard form format
    rows.push(['Question', 'Response'].join(','));
    keys.forEach(k => {
      const questionTitle = idToTitle[k] || k;
      let value = dataToExport[k];
      if (typeof value === 'boolean') {
        value = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        value = value.map(v => v === '__other__' ? (dataToExport[`${k}_other`] || 'Other') : v);
      } else if (value === '__other__') {
        value = dataToExport[`${k}_other`] || 'Other';
      }
      rows.push([escapeCSV(questionTitle), escapeCSV(value)].join(','));
    });
  }

  const csvString = rows.join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = `${projectData?.name?.replace(/\s+/g, '_')}_${formName.replace(/\s+/g, '_')}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Export Complete', `${filename} has been downloaded`);
};

export const exportAllFormResponsesToCSV = (formName: string, formKey: string, projects: any[], isDeliverables = false, template?: any) => {
  const submissions: { projectName: string; data: any }[] = [];
  projects.forEach(p => {
    const flag = 'has' + formKey.charAt(0).toUpperCase() + formKey.slice(1);
    const data = isDeliverables ? p.deliverables : (formKey === 'onboardingCsat' ? p.health?.onboardingCsat : p.onboarding?.[formKey]);
    
    if (p[flag] || (data && Object.keys(data).length > 0)) {
      submissions.push({ projectName: p.name, data: data || {} });
    }
  });

  if (submissions.length === 0) {
    toast.error('No Data', `No projects have submitted the ${formName} yet.`);
    return;
  }

  const idToTitle: Record<string, string> = {};
  if (template && template.fields) {
    template.fields.forEach((field: any) => {
      idToTitle[field.id] = field.label || field.id;
    });
  }
  // If no template (like deliverables), it's just keys
  if (isDeliverables) {
    // We can map known deliverable keys to nicer names, but we'll just use the keys or titleize them
  }

  let questionKeys: string[] = [];
  if (template && template.fields) {
    questionKeys = template.fields
      .filter((f: any) => f.type !== 'page_break' && f.type !== 'header')
      .map((f: any) => f.id);
  } else {
    const allKeys = new Set<string>();
    submissions.forEach(sub => {
      Object.keys(sub.data).forEach(k => {
        if (k !== 'submittedAt' && k !== 'updatedAt') {
          allKeys.add(k);
        }
      });
    });
    questionKeys = Array.from(allKeys);
  }

  // Headers (Row 1): 'Field', Proj A, Proj B, Proj C...
  const headers = ['Field', ...submissions.map(sub => sub.projectName || 'Unknown Project')];

  const rows = [];
  rows.push(['Submitted At', ...submissions.map(sub => sub.data.submittedAt ? new Date(sub.data.submittedAt).toLocaleDateString() : 'N/A')].map(escapeCSV).join(','));
  rows.push(['Updated At', ...submissions.map(sub => sub.data.updatedAt ? new Date(sub.data.updatedAt).toLocaleDateString() : 'N/A')].map(escapeCSV).join(','));
  
  rows.push(''); // Blank row separator
  
  questionKeys.forEach(k => {
    const questionTitle = idToTitle[k] || k;
    const rowData = [questionTitle, ...submissions.map(sub => {
      let value = sub.data[k];
      if (typeof value === 'boolean') {
        value = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        value = value.map(v => v === '__other__' ? (sub.data[`${k}_other`] || 'Other') : v);
      } else if (value === '__other__') {
        value = sub.data[`${k}_other`] || 'Other';
      }
      return value || '';
    })];
    rows.push(rowData.map(escapeCSV).join(','));
  });

  const csvString = [headers.map(escapeCSV).join(','), ...rows].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `All_${formName.replace(/\s+/g, '_')}_Responses_${dateStamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Export Complete', `${filename} has been downloaded`);
};