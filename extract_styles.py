import re

with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# find fonts
fonts = set(re.findall(r'https?://fonts\.[^\'"\s]+', html))
print("FONTS:", fonts)

# find colors (hex)
colors = set(re.findall(r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b', html))
print("SAMPLE COLORS:", list(colors)[:20])

# find style tags or link tags
links = re.findall(r'<link[^>]+stylesheet[^>]+>', html)
print(f"STYLESHEETS COUNT: {len(links)}")
for l in links[:10]:
    print(l)
