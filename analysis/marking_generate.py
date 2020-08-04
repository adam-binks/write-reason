import os
import json
import random

DIR = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\logs"

essays = {}
for fname in os.listdir(DIR):
    with open(os.path.join(DIR, fname), 'r', encoding="utf8") as f:
        data = json.load(f)
        essay = data['projects'][0]['log']['events']['document_content_markdown'][-1]['content']
        essays[fname] = essay


order = list(essays.keys())
random.shuffle(order)
with open('marker_sheet_final.txt', 'w') as f:
    f.write("\n\n\n".join(['pseudonum ' + str(i) + '\n\n' + essays[order[i]] for i in range(len(order))]))

    f.write('\n\n\n\n\n' + 'ORDER: ' + ', '.join(order))
