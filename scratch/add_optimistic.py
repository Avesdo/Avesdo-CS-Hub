import re

with open('src/api/dbService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'useAppStore' not in content:
    content = "import { useAppStore } from '../store/useAppStore';\n" + content

# 1. updateProjectRecord
proj_pattern = re.compile(r'(export async function updateProjectRecord\([\s\S]*?\{[\s\S]*?try \{)([\s\S]*?delete \(finalProject as any\)\.clients;\n)(.*await setDoc\(doc\(db, \'projects\', finalProject\.id\), finalProject\);[\s\S]*?\} catch \(err: any\) \{)', re.MULTILINE)

proj_replacement = r"""\1\2
    // --- OPTIMISTIC UPDATE ---
    const store = useAppStore.getState();
    const prevProjects = [...store.projects];
    const prevArchived = [...store.archivedProjects];
    const exists = store.projects.some(p => p.id === finalProject.id) || store.archivedProjects.some(p => p.id === finalProject.id);
    
    if (finalProject.isArchived) {
      store.setAppState({
        ...store,
        projects: store.projects.filter(p => p.id !== finalProject.id),
        archivedProjects: exists 
          ? store.archivedProjects.map(p => p.id === finalProject.id ? finalProject : p)
          : [...store.archivedProjects, finalProject]
      });
    } else {
      store.setAppState({
        ...store,
        projects: exists 
          ? store.projects.map(p => p.id === finalProject.id ? finalProject : p).concat(store.projects.some(p => p.id === finalProject.id) ? [] : [finalProject])
          : [...store.projects, finalProject],
        archivedProjects: store.archivedProjects.filter(p => p.id !== finalProject.id)
      });
    }
    // -------------------------
\3
      // Rollback on error
      useAppStore.getState().setAppState({ ...useAppStore.getState(), projects: prevProjects, archivedProjects: prevArchived });
"""

content = proj_pattern.sub(proj_replacement, content)

# 2. updateClientRecord
client_pattern = re.compile(r'(export async function updateClientRecord\([\s\S]*?\{[\s\S]*?try \{)([\s\S]*?delete \(finalClient as any\)\.projects;\n\s*delete \(finalClient as any\)\.services;\n)(.*await setDoc\(doc\(db, \'clients\', finalClient\.id\), finalClient\);[\s\S]*?\} catch \(err: any\) \{)', re.MULTILINE)

client_replacement = r"""\1\2
    // --- OPTIMISTIC UPDATE ---
    const store = useAppStore.getState();
    const prevClients = [...store.clients];
    const prevArchived = [...store.archivedClients];
    const exists = store.clients.some(c => c.id === finalClient.id) || store.archivedClients.some(c => c.id === finalClient.id);
    
    if (finalClient.isArchived) {
      store.setAppState({
        ...store,
        clients: store.clients.filter(c => c.id !== finalClient.id),
        archivedClients: exists 
          ? store.archivedClients.map(c => c.id === finalClient.id ? finalClient : c)
          : [...store.archivedClients, finalClient]
      });
    } else {
      store.setAppState({
        ...store,
        clients: exists 
          ? store.clients.map(c => c.id === finalClient.id ? finalClient : c).concat(store.clients.some(c => c.id === finalClient.id) ? [] : [finalClient])
          : [...store.clients, finalClient],
        archivedClients: store.archivedClients.filter(c => c.id !== finalClient.id)
      });
    }
    // -------------------------
\3
      // Rollback on error
      useAppStore.getState().setAppState({ ...useAppStore.getState(), clients: prevClients, archivedClients: prevArchived });
"""

content = client_pattern.sub(client_replacement, content)

# 3. updateServiceRecord
service_pattern = re.compile(r'(export async function updateServiceRecord\([\s\S]*?\{[\s\S]*?try \{)([\s\S]*?const finalService = \{ \.\.\.service \};\n\s*delete \(finalService as any\)\.clients;\n)(.*await setDoc\(doc\(db, \'services\', finalService\.id\), finalService\);[\s\S]*?\} catch \(err: any\) \{)', re.MULTILINE)

service_replacement = r"""\1\2
    // --- OPTIMISTIC UPDATE ---
    const store = useAppStore.getState();
    const prevServices = [...store.services];
    const prevArchived = [...store.archivedServices];
    const exists = store.services.some(s => s.id === finalService.id) || store.archivedServices.some(s => s.id === finalService.id);
    
    if (finalService.isArchived) {
      store.setAppState({
        ...store,
        services: store.services.filter(s => s.id !== finalService.id),
        archivedServices: exists 
          ? store.archivedServices.map(s => s.id === finalService.id ? finalService : s)
          : [...store.archivedServices, finalService]
      });
    } else {
      store.setAppState({
        ...store,
        services: exists 
          ? store.services.map(s => s.id === finalService.id ? finalService : s).concat(store.services.some(s => s.id === finalService.id) ? [] : [finalService])
          : [...store.services, finalService],
        archivedServices: store.archivedServices.filter(s => s.id !== finalService.id)
      });
    }
    // -------------------------
\3
      // Rollback on error
      useAppStore.getState().setAppState({ ...useAppStore.getState(), services: prevServices, archivedServices: prevArchived });
"""

content = service_pattern.sub(service_replacement, content)

with open('src/api/dbService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
