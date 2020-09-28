import os
import json
import random

DIR = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\logs"

# ESSAY TEXTS

essays = {}
for fname in [f'logs {str(n)}.json' for n in [21, 22, 23, 25, 26]]:
    with open(os.path.join(DIR, fname), 'r', encoding="utf8") as f:
        data = json.load(f)
        essay = data['projects'][0]['log']['events']['document_content_markdown'][-1]['content']
        essays[fname] = essay


order = list(essays.keys())
random.shuffle(order)
with open('marker_sheet_xt.txt', 'w') as f:
    f.write("\n\n\n".join(['pseudonum ' + str(i) + '\n\n' + essays[order[i]] for i in range(len(order))]))

    f.write('\n\n\n\n\n' + 'ORDER: ' + ', '.join(order))


# PRE-TASK QUESTIONS

# def print_answer(answer):
#     return f"Q1:\n{answer['q1']}\n\nQ2:\n{answer['q2']}\n\nQ3:\n{answer['q3']}"

# answers = {}
# for fname in os.listdir(DIR):
#     with open(os.path.join(DIR, fname), 'r', encoding="utf8") as f:
#         data = json.load(f)
#         answer = json.loads(data['preTaskSubmission'])
#         answers[fname] = answer

# for fname, answer in answers.items():
#     num = fname[len('logs '):-len('.json')]
#     with open(f'pretasks/{num}.txt', 'w') as f:
#         f.write(print_answer(answers[fname]))

# order = list(answers.keys())
# random.shuffle(order)
# with open('pretask_sheet_final.txt', 'w') as f:
#     f.write("\n\n\n".join(['pseudonum ' + str(i) + '\n\n' + print_answer(answers[order[i]]) for i in range(len(order))]))

#     f.write('\n\n\n\n\n' + 'ORDER: ' + ', '.join(order))
