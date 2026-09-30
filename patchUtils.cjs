const fs = require('fs');
let code = fs.readFileSync('src/utils/exportUtils.ts', 'utf8');

const targetIndex = code.indexOf('export const exportFullDatabaseToJSON = async () => {');
if (targetIndex !== -1) {
  code = code.substring(0, targetIndex);
}

const newFunc = `
export const exportFullDatabaseToJSON = async () => {
  toast.info('Preparing Full Backup...', 'Gathering all database records.');
  try {
    const { useAppStore } = await import('../store/useAppStore');
    const state = useAppStore.getState();
    const backupData = {
      timestamp: new Date().toISOString(),
      projects: state.projects,
      clients: state.clients,
      services: state.services,
      settings: state.settings,
      users: state.users,
      tags: state.tags || [],
    };
    
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = "Avesdo_CS_Hub_Full_Backup_" + dateStamp + ".json";
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup Complete', filename + ' has been downloaded securely.');
  } catch (err) {
    console.error(err);
    toast.error('Backup Failed', 'An error occurred while generating the backup.');
  }
};
`;

fs.writeFileSync('src/utils/exportUtils.ts', code + newFunc);
