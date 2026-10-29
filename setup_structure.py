import os
import json
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0'}

base_dir = r"c:\GitHub5\vibecoding\tsh3\tsh3demo1"

folders = [
    "assets/css",
    "assets/js",
    "assets/images",
    "assets/fonts",
    "assets/icons",
    "assets/data",
    "components",
    "pages",
    "docs",
    "config",
    "api-mock",
    "tests"
]

for f in folders:
    os.makedirs(os.path.join(base_dir, f), exist_ok=True)

print("Created folder structure.")
