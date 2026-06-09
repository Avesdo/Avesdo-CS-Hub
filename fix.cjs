const fs = require('fs');
let c = fs.readFileSync('C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Settings.tsx', 'utf8');

c = c.replace(/SettingsDraft/g, 'Settings');

c = c.replace(
    /const \{ settings, projects, clients, services, user \} = useAppState\(\);/g, 
    `const { settings, projects, clients, services, user, archivedClients, archivedProjects, archivedServices } = useAppState();`
);

c = c.replace(
    /useState<'org' \| 'workflow' \| 'products' \| 'scoring'>/g, 
    `useState<'org' | 'workflow' | 'products' | 'scoring' | 'archives'>`
);

c = c.replace(
    /ArchiveRestore, RotateCcw\r?\n\} from 'lucide-react';/g, 
    `ArchiveRestore, RotateCcw, Database\n} from 'lucide-react';`
);

c = c.replace(
    /\{ id: 'scoring', label: 'Scoring Engine', icon: Calculator \},/g, 
    `{ id: 'scoring', label: 'Scoring Engine', icon: Calculator },\n                        { id: 'archives', label: 'Archives', icon: ArchiveRestore },`
);

c = c.replace(
    /<h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Settings<\/h1>\r?\n                    <p className="text-base text-muted-foreground mt-1">Manage workspace configuration, organization, and system defaults.<\/p>\r?\n                <\/div>\r?\n            <\/div>/g, 
    `<h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Settings</h1>\n                    <p className="text-base text-muted-foreground mt-1">Manage workspace configuration, organization, and system defaults.</p>\n                </div>\n                <div>\n                    <button \n                        onClick={async () => {\n                            try {\n                                const { doc, setDoc, collection } = await import('firebase/firestore');\n                                const { db } = await import('../api/firebase');\n                                const clientId = crypto.randomUUID();\n                                await setDoc(doc(collection(db, 'clients'), clientId), { clientId, companyName: 'Acme Corp', clientType: 'Enterprise', status: 'Active', accountManager: 'Unassigned', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });\n                                const projectId = crypto.randomUUID();\n                                await setDoc(doc(collection(db, 'projects'), projectId), { id: projectId, name: 'Acme Hub Implementation', clientIds: [clientId], projectStatus: 'In Progress', onboardingPhase: 'Setup', timelineStatus: 'On Track', assignee: 'Unassigned', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });\n                                const serviceId = crypto.randomUUID();\n                                await setDoc(doc(collection(db, 'services'), serviceId), { id: serviceId, name: 'Platform Training', type: 'Training', clientIds: [clientId], projectId: projectId, status: 'Active', outcome: 'Pending', manager: 'Unassigned', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });\n                                window.location.reload();\n                            } catch (e) {\n                                console.error(e);\n                            }\n                        }}\n                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95"\n                    >\n                        <Database className="w-4 h-4" /> Inject Dummy Data\n                    </button>\n                </div>\n            </div>`
);

const renderArchivesCode = `    const renderArchives = () => {
        return (
            <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2"><ArchiveRestore className="w-4 h-4 text-primary"/> Archived Clients</h3>
                    {archivedClients && archivedClients.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {archivedClients.map((client) => (
                                <li key={client.clientId || client.id} className="py-3 flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{client.companyName}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRestoreRecordLocal('clients', client)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                                        <button onClick={() => handleHardDeleteRecordLocal('clients', client)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-all active:scale-95" title="Delete Permanently"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No archived clients.</p>}
                </div>

                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2"><ArchiveRestore className="w-4 h-4 text-primary"/> Archived Projects</h3>
                    {archivedProjects && archivedProjects.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {archivedProjects.map((project) => (
                                <li key={project.id} className="py-3 flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{project.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRestoreRecordLocal('projects', project)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                                        <button onClick={() => handleHardDeleteRecordLocal('projects', project)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-all active:scale-95" title="Delete Permanently"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No archived projects.</p>}
                </div>

                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2"><ArchiveRestore className="w-4 h-4 text-primary"/> Archived Services</h3>
                    {archivedServices && archivedServices.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {archivedServices.map((service) => (
                                <li key={service.id} className="py-3 flex justify-between items-center group">
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{service.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRestoreRecordLocal('services', service)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                                        <button onClick={() => handleHardDeleteRecordLocal('services', service)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-all active:scale-95" title="Delete Permanently"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No archived services.</p>}
                </div>

                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2"><ArchiveRestore className="w-4 h-4 text-primary"/> Archived Settings</h3>
                    {settings?.archivedData && Object.keys(settings.archivedData).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(settings.archivedData).map(([category, items]) => {
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-slate-600 mb-2 capitalize">{category}</h4>
                                        <ul className="divide-y divide-border border border-border rounded-md">
                                            {items.map((item, idx) => {
                                                const isSettingsData = category === 'settingsData';
                                                const itemName = typeof item === 'string' ? item : item.name;
                                                return (
                                                    <li key={idx} className="p-3 flex justify-between items-center group bg-slate-50">
                                                        <span className="text-sm font-medium text-slate-700">{itemName}</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleRestoreSetting(category, idx, isSettingsData)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                                                            <button onClick={() => handleHardDeleteSetting(category, idx, isSettingsData)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-all active:scale-95" title="Delete Permanently"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No archived settings.</p>}
                </div>
            </div>
        );
    };

    const handleRestoreSetting = async`;

c = c.replace(/    const handleRestoreSetting = async/g, renderArchivesCode);

c = c.replace(
    /                        <\/div>\r?\n                    \)}\r?\n                <\/div>/g, 
    `                        </div>\n                    )}\n                    {activeTab === 'archives' && renderArchives()}\n                </div>`
);

fs.writeFileSync('C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/Settings.tsx', c);
