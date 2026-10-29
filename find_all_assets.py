import re

with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# find all url(...) in the html or inline styles
bg_urls = set(re.findall(r'url\([\'"]?(https?://[^\'")\s]+)[\'"]?\)', text))
print("--- BACKGROUND URLS ---")
for u in sorted(bg_urls):
    print(u)

# find all images in wp-content/uploads
all_uploads = set(re.findall(r'https?://[^\'"\s,]+\.(?:png|jpg|jpeg|gif|webp|svg)', text))
print("\n--- ALL UPLOADS ---")
for u in sorted(all_uploads):
    print(u)
