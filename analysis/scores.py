# %%

import os
import pandas as pd

# %%
DIR = r'C:\Users\jelly\OneDrive - University of St Andrews\Summer study'

df = pd.read_csv(os.path.join(DIR, 'graph_analysis.csv'))

df = df.drop('Mean', 1)

bool_cols = [
    'Shallow graph',
    'Essay structure graph',
    'Evidence graph',
    'Cites sources',
    'Disconnected evi subgraphs',
    'Custom arrows',
    'Central node',
    'Yes/no nodes',
    'Arrow types semantic value',
    'Tree structure',
    'Nodes copied from fact sheet',
    'Sections'
]

for col in bool_cols:
    # todo preserve NaN
    df[col] = pd.Series(val == 1 for val in df[col])

cat_cols = [
    'Participant',
    'Pre-task',
    'Essay',
    'Interview'
]
for col in cat_cols:
    df[col] = df[col].astype('category')

score_cols = [
    'Clarity',
    'Persuasiveness',
    'Structure',
    'Obj-resp',
    'Overall'
]

df.dtypes

# %%

def group_and_bar(col):
    df.groupby(col).mean()[score_cols
        ].plot.bar().legend(bbox_to_anchor=(1,1))

# %%

for col in ['Essay', 'Pre-task', 'Interview']:
    group_and_bar(col)

# %%

for col in bool_cols:
    group_and_bar(col)