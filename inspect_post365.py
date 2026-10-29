with open('post-365.css', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
rules = re.findall(r'(\.[a-zA-Z0-9_\-\.\:\s,>+~]+\{[^\}]+\})', text)
for r in rules:
    if any(k in r for k in ['background', 'font-family', 'border', 'gradient', 'box-shadow', 'shape-divider']):
        if len(r) < 300:
            print(r)
            print('-'*40)
