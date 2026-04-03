import os
import re

files_to_fix = [
    "src/pages/StudyDashboard.tsx",
    "src/pages/StudyWorkspace.tsx",
    "src/pages/MobileStudyDashboard.tsx",
    "src/pages/MobileStudyWorkspace.tsx",
    "src/components/study/StudyWorkspaceLayout.tsx",
    "src/components/study/StudyDashboardHeader.tsx",
    "src/components/study/StudyDashboardOverlays.tsx",
    "src/components/study/StudyRecentUploads.tsx",
    "src/components/study/StudyWorkspaceNextSteps.tsx"
]

replacements = [
    (r'text-white(/\[?\d+%?\]?)?\b', lambda m: f'text-foreground{m.group(1) or ""}'),
    (r'bg-white/(\[?\d+%?\]?)\b', r'bg-foreground/\1'),
    (r'border-white/(\[?\d+%?\]?)\b', r'border-border'),
    (r'bg-\[#0[aA]0625\]', r'bg-card'),
    (r'bg-\[#161[aA]34[eE]6\]', r'bg-card'),
    (r'bg-\[#030014\]', r'bg-background'),
    (r'bg-\[#0[A-Fa-f0-9]{5,7}\]', r'bg-background'),
    (r'bg-\[linear-gradient.*?\]', r'bg-card'),
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    else:
        print(f"No changes for {filepath}")
