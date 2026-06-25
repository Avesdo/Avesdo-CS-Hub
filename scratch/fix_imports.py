import os

directory = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals'
modals = ['OnboardingSurveyModal.tsx', 'PrimaryQAModal.tsx', 'ClientQAModal.tsx', 'SecondaryQAModal.tsx', 'ProjectCertificationModal.tsx']

for filename in modals:
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The regex removed the closing bracket }
    content = content.replace(", Edit2 from 'lucide-react';", ", Edit2 } from 'lucide-react';")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
