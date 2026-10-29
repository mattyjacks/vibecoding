import urllib.request
import re

css_urls = [
    "https://www.tristatehoney.com/wp-content/uploads/elementor/css/post-10.css?ver=1793212482",
    "https://www.tristatehoney.com/wp-content/uploads/elementor/css/post-365.css",
    "https://www.tristatehoney.com/wp-content/uploads/elementor/css/global.css"
]

headers = {'User-Agent': 'Mozilla/5.0'}
for url in css_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            print(f"Downloaded {url} ({len(content)} chars)")
            with open(url.split('/')[-1].split('?')[0], 'w', encoding='utf-8') as f:
                f.write(content)
            # Find any image URLs in css
            imgs = re.findall(r'url\([\'"]?(https?://[^\'")\s]+)[\'"]?\)', content)
            if imgs:
                print("Found images in CSS:", imgs)
    except Exception as e:
        print(f"Error {url}: {e}")
