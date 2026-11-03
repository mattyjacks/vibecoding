"""Check local HTML/CSS references without installing dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import re

root = Path(__file__).parent
errors = []
class Check(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value and value.startswith('./'):
                target = self.source.parent / unquote(urlparse(value).path)
                if not target.exists():
                    errors.append(f'{self.source.name}: {value}')

for source in root.glob('*.html'):
    Check(source).feed(source.read_text(encoding='utf-8'))
for source in (root / 'css').glob('*.css'):
    for value in re.findall(r'url\("([^"]+)"\)', source.read_text(encoding='utf-8')):
        if not (source.parent / value).exists(): errors.append(f'{source.name}: {value}')
assert not errors, '\n'.join(errors)
assert len(list(root.rglob('*.*'))) >= 30
assert 'https://wa.me/639562991298' in (root / 'index.html').read_text(encoding='utf-8')
print(f'PASS: local HTML/CSS references, WhatsApp contact, {sum(p.is_file() for p in root.rglob("*"))} files.')
