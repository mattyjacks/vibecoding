import os
import re

base_dir = r"c:\GitHub5\vibecoding\tsh3\tsh3demo1"

with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Replace all https://www.tristatehoney.com/wp-content/uploads/ with assets/images/
# and handle css files
def replace_asset_links(match):
    url = match.group(0)
    filename = url.split('/')[-1].split('?')[0]
    if filename.endswith('.css'):
        return f"assets/css/{filename}"
    elif filename.endswith('.js'):
        return f"assets/js/{filename}"
    else:
        return f"assets/images/{filename}"

# Replace URLs
transformed_html = re.sub(r'https?://(?:www\.)?tristatehoney\.com/wp-content/uploads/[^\'"\s\),]+', replace_asset_links, html)
transformed_html = re.sub(r'https?://(?:www\.)?tristatehoney\.com/wp-content/plugins/[^\'"\s\),]+', replace_asset_links, transformed_html)
transformed_html = re.sub(r'https?://(?:www\.)?tristatehoney\.com/wp-includes/[^\'"\s\),]+', replace_asset_links, transformed_html)

# Also check for the background images that were downloaded
transformed_html = transformed_html.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/1st-frame-pouring-fixed-honey-loop-HD.jpg', 'assets/images/honey-pouring-bg.jpg')
transformed_html = transformed_html.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/purple-flowers-FULL-pexels-nguyen-ngoc-tien-1321490019-30400862-scaled.jpg', 'assets/images/purple-flowers-bg.jpg')
transformed_html = transformed_html.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/tristatehoney-bee-logo-50px-right-facing-trans.png', 'assets/images/bee-logo-right.png')

# In post-365.css, also replace background images
post365_path = os.path.join(base_dir, "assets", "css", "post-365.css")
if os.path.exists(post365_path):
    with open(post365_path, 'r', encoding='utf-8', errors='ignore') as f:
        css_content = f.read()
    css_content = css_content.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/1st-frame-pouring-fixed-honey-loop-HD.jpg', '../images/honey-pouring-bg.jpg')
    css_content = css_content.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/purple-flowers-FULL-pexels-nguyen-ngoc-tien-1321490019-30400862-scaled.jpg', '../images/purple-flowers-bg.jpg')
    css_content = css_content.replace('https://www.tristatehoney.com/wp-content/uploads/2025/01/tristatehoney-bee-logo-50px-right-facing-trans.png', '../images/bee-logo-right.png')
    with open(post365_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Updated post-365.css with local asset links.")

# Save master index.html
output_index = os.path.join(base_dir, "index.html")
with open(output_index, 'w', encoding='utf-8') as f:
    f.write(transformed_html)

print(f"Successfully generated perfect clone at {output_index} ({len(transformed_html)} bytes)")
