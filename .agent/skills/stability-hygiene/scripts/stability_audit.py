import os
import re
import sys

def scan_file(file_path):
    issues = {
        "empty_catch": [],
        "large_undocumented": [],
        "todo_sketchy": [],
        "external_calls": []
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            content = "".join(lines)
            
            # 1. Empty catch blocks
            # Matches catch(e) {} or catch {}
            empty_catch_pattern = re.compile(r'catch\s*\([^)]*\)\s*{\s*}|catch\s*{\s*}', re.MULTILINE)
            for m in empty_catch_pattern.finditer(content):
                line_no = content.count('\n', 0, m.start()) + 1
                issues["empty_catch"].append(line_no)
                
            # 2. Large functions without docstrings
            # Rough approximation for JS/TS/Python
            func_pattern = re.compile(r'(async\s+)?function\s+\w+\s*\(|(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>\s*{', re.MULTILINE)
            for m in func_pattern.finditer(content):
                line_no = content.count('\n', 0, m.start()) + 1
                # Check if previous lines have a comment
                prev_lines = lines[max(0, line_no-5):line_no-1]
                has_doc = any("/**" in l or "'''" in l or '"""' in l for l in prev_lines)
                
                # Count function length (very basic brace counting)
                start_index = m.end()
                brace_count = 1
                func_end_line = line_no
                for i in range(start_index, len(content)):
                    if content[i] == '{': brace_count += 1
                    if content[i] == '}': brace_count -= 1
                    if content[i] == '\n': func_end_line += 1
                    if brace_count == 0: break
                
                if (func_end_line - line_no) > 40 and not has_doc:
                    issues["large_undocumented"].append(line_no)
            
            # 3. Sketchy TODOs or console.log
            sketchy_pattern = re.compile(r'TODO|FIXME|sketchy|hack|console\.log', re.IGNORECASE)
            for m in sketchy_pattern.finditer(content):
                line_no = content.count('\n', 0, m.start()) + 1
                issues["todo_sketchy"].append((line_no, m.group()))

            # 4. External calls (fetch, axios, stripe, etc.)
            external_pattern = re.compile(r'fetch\(|axios\.|stripe\.|openai\.', re.IGNORECASE)
            for m in external_pattern.finditer(content):
                line_no = content.count('\n', 0, m.start()) + 1
                issues["external_calls"].append((line_no, m.group()))

    except Exception as e:
        pass
        
    return issues

def main():
    root_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    exclude_dirs = {".git", "node_modules", ".next", "dist", "build", "_generated"}
    
    print(f"## Stability Audit Results (Quiet Rebuild Scan)")
    print(f"Directory: {os.path.abspath(root_dir)}\n")
    
    total_issues = 0
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.py')):
                file_path = os.path.join(root, file)
                issues = scan_file(file_path)
                
                rel_path = os.path.relpath(file_path, root_dir)
                
                file_has_issues = any(issues.values())
                if file_has_issues:
                    print(f"### 📄 {rel_path}")
                    
                    if issues["empty_catch"]:
                        print(f"- ⚠️ **Empty Catch Blocks**: Lines {', '.join(map(str, issues['empty_catch']))}")
                        total_issues += len(issues["empty_catch"])
                        
                    if issues["large_undocumented"]:
                        print(f"- ⚠️ **Large Undocumented Function (>40 lines)**: Lines {', '.join(map(str, issues['large_undocumented']))}")
                        total_issues += len(issues["large_undocumented"])
                        
                    if issues["todo_sketchy"]:
                        print(f"- 📝 **Sketchy Markers**: " + ", ".join([f"L{l} ({g})" for l, g in issues["todo_sketchy"]]))
                        total_issues += len(issues["todo_sketchy"])
                        
                    if issues["external_calls"]:
                        print(f"- 🌐 **External API Calls (Check resilient wrapping)**: " + ", ".join([f"L{l} ({g})" for l, g in issues["external_calls"]]))
                    
                    print("")

    if total_issues == 0:
        print("✅ **No critical stability issues found.** Your code looks clean!")
    else:
        print(f"Found {total_issues} potential stability blockers. Review these before your next 'Big Call'.")

if __name__ == "__main__":
    main()
