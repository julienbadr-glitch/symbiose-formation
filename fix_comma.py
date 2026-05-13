import sys
f = open('data.js', 'r')
lines = f.readlines()
f.close()

fixed = 0
for i in range(len(lines) - 1):
    stripped = lines[i].rstrip('\n').rstrip('\r')
    next_stripped = lines[i+1].strip()
    # If line ends with ] (no comma) and next line starts with script: or quiz:
    if stripped.endswith(']') and not stripped.endswith('],') and next_stripped.startswith(('script:', 'quiz:')):
        lines[i] = stripped + ',\n'
        fixed += 1
        print(f'Fixed line {i+1}: added comma before {next_stripped[:20]}')

if fixed > 0:
    f = open('data.js', 'w')
    f.writelines(lines)
    f.close()
    print(f'Total: {fixed} comma(s) added')
else:
    print('No fixes needed')
