import os
import re
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0'}

with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Target directories
base_dir = r"c:\GitHub5\vibecoding\tsh3\tsh3demo1"
css_dir = os.path.join(base_dir, "assets", "css")
js_dir = os.path.join(base_dir, "assets", "js")
img_dir = os.path.join(base_dir, "assets", "images")
os.makedirs(css_dir, exist_ok=True)
os.makedirs(js_dir, exist_ok=True)
os.makedirs(img_dir, exist_ok=True)

# 1. Extract and download all external stylesheets linked in the html
css_links = re.findall(r'<link[^>]+rel=[\'"]stylesheet[\'"][^>]+href=[\'"]([^\'"]+)[\'"]', html)
css_map = {}

for link in set(css_links):
    if 'fonts.googleapis.com' in link:
        continue  # Keep Google fonts as external
    clean_url = link.split('?')[0]
    filename = os.path.basename(clean_url)
    if not filename.endswith('.css'):
        filename += '.css'
    local_path = os.path.join(css_dir, filename)
    rel_path = f"assets/css/{filename}"
    
    try:
        req = urllib.request.Request(link, headers=headers)
        with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded CSS: {filename}")
        css_map[link] = rel_path
    except Exception as e:
        print(f"Error downloading CSS {link}: {e}")

# 2. Extract and download all external scripts
js_links = re.findall(r'<script[^>]+src=[\'"]([^\'"]+)[\'"]', html)
js_map = {}

for link in set(js_links):
    clean_url = link.split('?')[0]
    filename = os.path.basename(clean_url)
    if not filename.endswith('.js'):
        filename += '.js'
    local_path = os.path.join(js_dir, filename)
    rel_path = f"assets/js/{filename}"
    
    try:
        req = urllib.request.Request(link, headers=headers)
        with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded JS: {filename}")
        js_map[link] = rel_path
    except Exception as e:
        print(f"Error downloading JS {link}: {e}")

# 3. Extract and download all images from HTML and CSS
img_urls = set(re.findall(r'https?://(?:www\.)?tristatehoney\.com/wp-content/uploads/[^\'"\s\),]+', html))
img_map = {}

for img_url in img_urls:
    clean_url = img_url.split('?')[0]
    filename = os.path.basename(clean_url)
    local_path = os.path.join(img_dir, filename)
    rel_path = f"assets/images/{filename}"
    
    if not os.path.exists(local_path):
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out_f:
                out_f.write(resp.read())
            print(f"Downloaded Image: {filename}")
        except Exception as e:
            print(f"Error downloading Image {img_url}: {e}")
    img_map[img_url] = rel_path

print(f"Downloaded {len(css_map)} CSS, {len(js_map)} JS, {len(img_map)} Images.")
