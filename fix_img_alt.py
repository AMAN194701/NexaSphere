import os
import re

for r, d, files in os.walk('src'):
    for f in files:
        if f.endswith(('.jsx', '.tsx', '.js', '.ts')):
            filepath = os.path.join(r, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
            
            # Find <img ...> that doesn't have alt=
            pattern = re.compile(r'<img\s+(?![^>]*alt=)[^>]*>', re.IGNORECASE)
            
            def replace_img(match):
                tag = match.group(0)
                if tag.endswith('/>'):
                    return tag[:-2] + ' alt="" />'
                else:
                    return tag[:-1] + ' alt="">'
            
            new_content = pattern.sub(replace_img, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Fixed {filepath}")
