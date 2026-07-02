import os
import re

# Files to skip (like Hero, where images should be eager loaded)
SKIP_FILES = ['Hero.tsx']

def process_file(filepath):
    filename = os.path.basename(filepath)
    if filename in SKIP_FILES:
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <img tags that do not already have loading="lazy"
    # It replaces `<img ` with `<img loading="lazy" `
    # To be safe and handle multi-line tags, we use a simple approach:
    # Find all <img tags. If they don't have loading="lazy", add it right after <img
    
    new_content = re.sub(r'<img\b(?![^>]*\bloading=["\']lazy["\'])', '<img loading="lazy"', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    dirs_to_scan = ['src/components', 'src/pages']
    for d in dirs_to_scan:
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.jsx'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
