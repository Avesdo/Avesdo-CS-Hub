import os
import re

directory = 'C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/modals'
for filename in os.listdir(directory):
    if filename.endswith('Modal.tsx'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        pattern = re.compile(r'\s*<div className="bg-blue-50[^>]*>.*?<strong>Instructions:</strong>.*?</div>', re.DOTALL)
        
        new_content = pattern.sub('', content)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
