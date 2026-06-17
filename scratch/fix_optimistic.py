import re

with open('src/api/dbService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix updateProjectRecord
content = re.sub(
    r'(try \{)(\s*const timeVal)',
    r'let prevProjects: any[] = [];\n  let prevArchivedProjects: any[] = [];\n  \1\2',
    content
)

content = content.replace('const prevProjects = [...store.projects];', 'prevProjects = [...store.projects];')
content = content.replace('const prevArchived = [...store.archivedProjects];', 'prevArchivedProjects = [...store.archivedProjects];')
content = content.replace('archivedProjects: prevArchived', 'archivedProjects: prevArchivedProjects')

# Fix updateClientRecord
content = re.sub(
    r'(export async function updateClientRecord[\s\S]*?)(try \{)(\s*const timeVal)',
    r'\1let prevClients: any[] = [];\n  let prevArchivedClients: any[] = [];\n  \2\3',
    content
)

content = content.replace('const prevClients = [...store.clients];', 'prevClients = [...store.clients];')
content = content.replace('const prevArchived = [...store.archivedClients];', 'prevArchivedClients = [...store.archivedClients];')
content = content.replace('archivedClients: prevArchived', 'archivedClients: prevArchivedClients')

# Fix updateServiceRecord
content = re.sub(
    r'(export async function updateServiceRecord[\s\S]*?)(try \{)(\s*const timeVal)',
    r'\1let prevServices: any[] = [];\n  let prevArchivedServices: any[] = [];\n  \2\3',
    content
)

content = content.replace('const prevServices = [...store.services];', 'prevServices = [...store.services];')
content = content.replace('const prevArchived = [...store.archivedServices];', 'prevArchivedServices = [...store.archivedServices];')
content = content.replace('archivedServices: prevArchived', 'archivedServices: prevArchivedServices')

with open('src/api/dbService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed")
