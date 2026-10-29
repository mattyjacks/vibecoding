import re
import urllib.parse

with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

links = set(re.findall(r'href=[\'"](https?://(?:www\.)?tristatehoney\.com[^\'"#\?]*)[\'"]', text))
print('--- LINKS ---')
for l in sorted(links):
    print(l)

images = set(re.findall(r'src=[\'"](https?://[^\'"\s]+\.(?:png|jpg|jpeg|gif|webp|svg))[\'"]', text))
srcset = set(re.findall(r'(https?://[^\'"\s,]+\.(?:png|jpg|jpeg|gif|webp|svg))', text))
all_imgs = images.union(srcset)
print(f'\n--- IMAGES COUNT: {len(all_imgs)} ---')
for img in sorted(all_imgs)[:30]:
    print(img)
