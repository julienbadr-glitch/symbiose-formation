with open('data.js','r') as f:
    lines = f.readlines()
S = 51
E = 213
for i in range(S, E):
    print(f'{i+1}: {lines[i]}', end='')
