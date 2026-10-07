import os
import glob

def fix_encoding(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    try:
        # Convert the garbled characters back to their Windows-1251 bytes
        # Then decode those bytes as UTF-8
        fixed_content = content.encode('cp1251').decode('utf-8')
        
        # If successful, write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed: {filepath}")
    except Exception as e:
        # If it fails, it means there are characters that don't map to cp1251,
        # or the resulting bytes aren't valid UTF-8.
        # This usually means the file is already fine or has mixed encodings.
        pass

# Files to fix
files = glob.glob('frontend/src/**/*.jsx', recursive=True) + glob.glob('frontend/src/**/*.js', recursive=True)
for filepath in files:
    fix_encoding(filepath)
