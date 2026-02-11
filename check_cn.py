
import os
import re

def check_missing_cn_import(directory):
    missing_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    # Check if 'cn(' is used
                    if "cn(" in content:
                        # Check if 'cn' is imported
                        is_imported = re.search(r"import\s+.*\{.*cn.*\}", content) or re.search(r"import\s+cn\s+from", content)
                        
                        # Check if 'cn' is defined locally
                        is_defined = "export function cn" in content or "const cn =" in content or "function cn" in content
                        
                        if not is_imported and not is_defined:
                            missing_files.append(filepath)
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    return missing_files

if __name__ == "__main__":
    src_dir = r"c:\Users\alaat\Downloads\cryonex-appv2-main\cryonex-appv2-main\src"
    missing = check_missing_cn_import(src_dir)
    if missing:
        print("Files missing 'cn' import:")
        for f in missing:
            print(f)
    else:
        print("No missing 'cn' imports found.")
