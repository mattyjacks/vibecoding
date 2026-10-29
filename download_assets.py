import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

target_dir = r"c:\GitHub5\vibecoding\tsh3\tsh3demo1\assets\images"
os.makedirs(target_dir, exist_ok=True)

images = [
    ("logo.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969-r0hfs2ooopa10i1jp52vowu7jne2vn0sewxm9l6rsw.png"),
    ("logo_orig.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969.png"),
    ("favicon_32.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/cropped-small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969-32x32.png"),
    ("favicon_180.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/cropped-small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969-180x180.png"),
    ("favicon_192.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/cropped-small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969-192x192.png"),
    ("favicon_270.png", "https://www.tristatehoney.com/wp-content/uploads/2025/01/cropped-small-tristate_honey_logo_v11_trans_bg_clean-e1737731498969-270x270.png"),
    ("tsh-1-lb-bear.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/tsh-1-lb-bear-e1738272591265-r0sc815w5vc6xiyqyjqwxr6bth2bg0k7w1y4awm2v4.png"),
    ("tsh-2-lb-bottle.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/tsh-2-lb-bottle-e1738272612720-r0sc8kwi5e37pc62raa2w470akd0xnqkyrnbdpst8g.png"),
    ("tsh-60-lb-bucket.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/tsh-60-lb-bucket-e1738272628252-r0sc8zxx6qnsv3k8bgs400edsqawcteacu33256igw.png"),
    ("tsh-660-lb-drum.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/tsh-660-lb-drum-e1738272646419-r0sc9hsuslc8zouaf6i0tdw531uvf2d6rahb6eg16o.png"),
    ("tsh-3000-lb-tote.png", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/tsh-3000-lb-tote-1-e1738285318791-r0slgc1uac8heq9zjorrxeds4d6rnus1wsqr3hwl4w.png"),
    ("bee-sunflower.jpg", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/bee-MEDIUM-sunflower-close-pexels-caio-772571-r0jc3sog2chdgofnxrf2284ujuk9vjd0b2uylzury8.jpg"),
    ("blue-barrels-warehouse.jpg", "https://www.tristatehoney.com/wp-content/uploads/elementor/thumbs/blue-barrels-warehouse-honey-r0u86a54l5woxp24azw1w3o1lbq03u8dgfklhg8oti.jpg"),
]

headers = {'User-Agent': 'Mozilla/5.0'}
for fname, url in images:
    filepath = os.path.join(target_dir, fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(filepath, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded {fname} ({os.path.getsize(filepath)} bytes)")
    except Exception as e:
        print(f"Error {fname}: {e}")
