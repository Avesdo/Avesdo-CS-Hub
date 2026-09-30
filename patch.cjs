const fs = require('fs');
let code = fs.readFileSync('src/components/admin/DataExportHub.tsx', 'utf8');

code = code.replace(
  'import { FileDown, FileSpreadsheet, Loader2, Database } from \'lucide-react\';',
  'import { FileDown, FileSpreadsheet, Loader2, Database, HardDriveDownload } from \'lucide-react\';\nimport { exportFullDatabaseToJSON } from \'../../utils/exportUtils\';'
);

code = code.replace(
  'export function DataExportHub({ projects, getTemplate }: DataExportHubProps) {\n  const [downloading, setDownloading] = useState<string | null>(null);',
  'export function DataExportHub({ projects, getTemplate }: DataExportHubProps) {\n  const [downloading, setDownloading] = useState<string | null>(null);\n\n  const handleFullBackup = async () => {\n    setDownloading(\'full_backup\');\n    await exportFullDatabaseToJSON();\n    setDownloading(null);\n  };'
);

code = code.replace(
  '<div className="w-full">\n      <div className="grid',
  `<div className="w-full space-y-8">
      {/* Full Backup Hero Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <HardDriveDownload className="w-5 h-5 text-emerald-400" /> Complete Database Backup
          </h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Download a secure, complete JSON snapshot of your entire workspace including all projects, clients, user access records, and raw historical data.
          </p>
        </div>
        <button
          onClick={handleFullBackup}
          disabled={downloading === 'full_backup'}
          className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          {downloading === 'full_backup' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {downloading === 'full_backup' ? 'Generating...' : 'Download Complete Backup'}
        </button>
      </div>

      <div className="grid`
);

fs.writeFileSync('src/components/admin/DataExportHub.tsx', code);
