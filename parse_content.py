import html.parser

class TextExtractor(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.entries = []

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        attrs_dict = dict(attrs)
        if tag == 'a' and 'href' in attrs_dict:
            self.entries.append(f"LINK: {attrs_dict['href']}")
        if tag == 'video' or tag == 'source':
            if 'src' in attrs_dict:
                self.entries.append(f"VIDEO/MEDIA: {attrs_dict['src']}")
        if tag == 'img' and 'src' in attrs_dict:
            self.entries.append(f"IMG: {attrs_dict.get('src')}")

    def handle_endtag(self, tag):
        if self.tags and self.tags[-1] == tag:
            self.tags.pop()

    def handle_data(self, data):
        text = data.strip()
        if text and len(text) > 1:
            curr_tag = self.tags[-1] if self.tags else 'root'
            if curr_tag not in ['script', 'style']:
                self.entries.append(f"[{curr_tag}] {text}")

parser = TextExtractor()
with open('tristatehoney_raw.html', 'r', encoding='utf-8', errors='ignore') as f:
    parser.feed(f.read())

with open('site_content_summary.txt', 'w', encoding='utf-8') as out:
    for e in parser.entries:
        out.write(e + '\n')

print(f"Extracted {len(parser.entries)} entries.")
