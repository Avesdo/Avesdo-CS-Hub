import { toast } from './toast';

export const escapeCSV = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Unassigned';
    if (Array.isArray(value)) value = value.join(', ');
    
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const mapClientRow = (c: any) => [
    escapeCSV(c.companyName || 'Unnamed Client'),
    escapeCSV(c.clientType),
    escapeCSV(c.healthScore),
    escapeCSV(c.activeProjectsCount ?? 0),
    escapeCSV(c.onboardingProjectsCount ?? 0),
    escapeCSV(c.closedProjectsCount ?? 0),
    escapeCSV(c.accountManager)
].join(',');

const mapProjectRow = (p: any) => [
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
    escapeCSV(p.checklistUrl || '')
].join(',');

const mapServiceRow = (s: any) => [
    escapeCSV(s.name || 'Unnamed Service'),
    escapeCSV(s.projectName || s.project),
    escapeCSV(s.type),
    escapeCSV(s.clientName || s.clients || s.client),
    escapeCSV(s.manager),
    escapeCSV(s.price ?? 0),
    escapeCSV(s.outcome),
    escapeCSV(s.status),
    escapeCSV(s.dateStr || 'No Date'),
    escapeCSV(s.invoiceSent ? 'Yes' : 'No'),
    escapeCSV(s.invoicePaid ? 'Yes' : 'No'),
    escapeCSV(s.commission ?? 0),
    escapeCSV(s.commissionPaid ? 'Yes' : 'No'),
    escapeCSV(s.datePaidStr || 'No Date')
].join(',');

export const universalExportCSV = (entityType: 'Clients' | 'Projects' | 'Services', data: any[], filenamePrefix: string) => {
    toast.info('Preparing export...', `Processing ${data.length} records.`);

    if (!data || data.length === 0) {
        toast.error('No data to export', 'The selected dataset is empty.');
        return;
    }

    let headers: string[] = [];
    let csvRows: string[] = [];

    if (entityType === 'Clients') {
        headers = ['Client Name', 'Client Type', 'Health Score', 'Active Projects', 'Onboarding Projects', 'Closed Projects', 'Manager'];
        csvRows = data.map(mapClientRow);
    } else if (entityType === 'Projects') {
        headers = ['Project Name', 'Client(s)', 'Health Score', 'Release Date', 'Manager', 'Project Status', 'Schedule Status', 'Implementation Milestone', 'Live Units', 'Active Features', 'Deliverables Checklist'];
        csvRows = data.map(mapProjectRow);
    } else if (entityType === 'Services') {
        headers = ['Service Name', 'Project Name', 'Service Type', 'Client Name', 'Manager', 'Service Value', 'Outcome', 'Fulfillment Status', 'Date', 'Invoice Sent', 'Invoice Paid', 'Commission Value', 'Commission Paid', 'Date Paid'];
        csvRows = data.map(mapServiceRow);
    }

    const csvString = [headers.map(h => escapeCSV(h)).join(','), ...csvRows].join('\n');
    
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

    toast.success('Export Complete', `${filename} has been downloaded.`);
};
