import urllib.request
import os

target_dir = r"c:\GitHub5\vibecoding\tsh3\tsh3demo1\assets\images"
os.makedirs(target_dir, exist_ok=True)

images_to_download = [
    ("honey-pouring-bg.jpg", "https://www.tristatehoney.com/wp-content/uploads/2025/01/1st-frame-pouring-fixed-honey-loop-HD.jpg"),
    ("purple-flowers-bg.jpg", "https://www.tristatehoney.com/wp-content/uploads/2025/01/purple-flowers-FULL-pexels-nguyen-ngoc-tien-1321490019-30400862-scaled.jpg"),
    ("bee-logo-right.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/tristatehoney-bee-logo-50px-right-facing-trans.png"),
]

headers = {'User-Agent': 'Mozilla/5.0'}
for fname, url in images_to_download:
    filepath = os.path.join(target_dir, fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(filepath, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded {fname} ({os.path.getsize(filepath)} bytes)")
    except Exception as e:
        print(f"Error {fname}: {e}")
