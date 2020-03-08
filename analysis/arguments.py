import random
import json
import os
import docx
from docx.shared import Inches


DATA_DIR = 'C:\\Users\\jelly\\Desktop\\sh_data'
HEADING = '## '

QUESTIONS = {
    'sspace': 'Should “shared spaces” in urban planning be promoted?',
    'biohacking': 'Should greater regulatory control be exerted over genetic biohacking?'
}


def get_question(cond, graph_is_first, sspace_is_first):
    is_first = (cond == "graph" and graph_is_first) or (cond == "plain" and not graph_is_first)
    if is_first:
        if sspace_is_first:
            return "sspace"
        else:
            return "biohacking"
    else:
        if sspace_is_first:
            return "biohacking"
        else:
            return "sspace"


def get_args():
    args = {'graph': {}, 'plain': {}}

    for filename in os.listdir(DATA_DIR):
        with open(os.path.join(DATA_DIR, filename), 'r') as f:
            data = json.load(f)
            arg = data['argument'].replace('&#x27;', "'").replace('&quot;', '"').replace('&gt;', '>')
            params = data['params']
            question = get_question(params['condition'], params['novelToolFirst'], params['sspaceFirst'])
            args[params['condition']][int(params['experimentId'])] = {'arg': arg, 'question': question}

    return args


def get_orderings(args):
    orderings = {}
    for cond in args:
        ordering = list(args[cond].keys())
        random.shuffle(ordering)
        orderings[cond] = ordering

    return orderings


def add_arg(doc, arg, question):
    doc.add_paragraph(QUESTIONS[question], style="Heading 2")

    for para in arg.split('\n'):
        is_heading = para.startswith(HEADING)
        if is_heading:
            para = para[len(HEADING):]

        if para:
            style = "Heading 3" if is_heading else "Normal"
            doc.add_paragraph(para, style=style)

    table = doc.add_table(rows=2, cols=5, style="Table Grid")
    header_texts = ['Clarity', 'Persuasiveness', 'Structure', 'Objection responsiveness', 'Overall assessment']
    headers = table.rows[0].cells
    assert(len(headers) == len(header_texts))
    for i, header in enumerate(headers):
        header.text = header_texts[i]

    for cell in table.rows[1].cells:
        cell.text = "       /10"


def generate_doc(first_cond, second_cond):
    document = docx.Document()

    args = get_args()
    assert (len(args['graph']) == len(args['plain']))

    orderings = get_orderings(args)
    print(orderings)

    for i in range(len(orderings['graph'])):
        for cond in [first_cond, second_cond]:
            add_arg(document, **args[cond][orderings[cond][i]])

            if cond == first_cond or i < len(orderings['graph']) - 1:
                document.add_page_break()

    for section in document.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.3)

    return document


if __name__ == '__main__':
    condition_orderings = [
        ["plain", "graph"],
        ["graph", "plain"],
        ["plain", "graph"],
    ]
    for i in range(1, 4):
        doc_filename = f'marker_sheet_{i}.docx'
        document_generated = generate_doc(*condition_orderings[i-1])

        try:
            os.remove(doc_filename)
        except FileNotFoundError:
            pass

        document_generated.save(doc_filename)
