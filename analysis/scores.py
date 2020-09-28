# %%

import os
import json
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# %%
DIR = r'C:\Users\jelly\OneDrive - University of St Andrews\Summer study'

df = pd.read_csv(os.path.join(DIR, 'graph_analysis.csv'))

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
    'Copied fact sheet',
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

df['Nodes in text proportion'] = df['Nodes in text'] / df['Total nodes']

df['Both graphs'] = df['Essay structure graph'] & df['Evidence graph']

df['Structure graph only'] = df['Essay structure graph'] & (~ df['Evidence graph'])

df['Evidence graph only'] = (~ df['Essay structure graph']) & df['Evidence graph']

bool_cols.extend(['Both graphs', 'Structure graph only', 'Evidence graph only'])
# %%

def run_ttest(df_a, df_b, col, should_print=True, decimal_places=3, ttest=stats.ttest_ind):
    a = df_a[col]
    b = df_b[col]
    ttest_result = ttest(a, b)
    if should_print:
        print(f't({int(len(a))-1})={round(ttest_result.statistic, decimal_places)}'
              f', p={round(ttest_result.pvalue, decimal_places)}\n')
    
    return ttest_result

def group_and_bar(col, val1=True, val2=False):
    df.groupby(col).mean()[score_cols
        ].plot(kind='bar').legend(bbox_to_anchor=(1,1))
    plt.show()

    if val1 != True or val2 != False:
        print(f'ttest {val1} vs {val2}')
    
    sig = []
    for score in score_cols:
        result = run_ttest(df[df[col] == val1], df[df[col] == val2], score, should_print=False)
        if result.pvalue < 0.05:
            sig.append(score)
    
    if sig:
        print(f'significant: ' + ', '.join(sig) + '\n')
    else:
        print('no significant' + '\n')

# %%

for col in ['Essay', 'Pre-task']:
    group_and_bar(col, val1="Multi-structural", val2="Relational")

group_and_bar("Interview", val1="Multistructural", val2="Relational")

# %%

for col in bool_cols:
    group_and_bar(col)

# %%

# load node reports from additional analysis

with open(os.path.join(DIR, 'nodeReports.json'), 'r', encoding="utf8") as f:
    data = json.load(f)

    new_cols = {a: [] for a in [
        'linkedCharsProportion', 'linkedWordsProportion'
    ]}
    for log, report in data.items():
        new_cols['linkedCharsProportion'].append(report['linkedCharsProportion'])
        new_cols['linkedWordsProportion'].append(report['linkedWordProportion'])

    for col, contents in new_cols.items():
        df[col] = contents

# %%

df.plot(x='Overall', y='linkedWordsProportion', kind='scatter')
plt.show()
df.hist('linkedWordsProportion', bins=20)
plt.show()
sns.swarmplot(data=df, x='Essay structure graph', y='linkedWordsProportion')
plt.show()
sns.swarmplot(data=df, x='Shallow graph', y='linkedWordsProportion')
plt.show()
sns.swarmplot(data=df, x='Tree structure', y='linkedWordsProportion')
plt.show()

# %%

for col in cat_cols:
    sns.swarmplot(data=df, x=col, y='linkedWordsProportion')
    plt.show()

# %%

df.hist('Nodes in text proportion', bins=20)
plt.show()
sns.scatterplot(data=df, x='linkedWordsProportion', y='Nodes in text proportion')
plt.show()
# %%
df.plot(x='linkedWordsProportion', y='Overall', kind='scatter')
df.plot(x='Total nodes', y='Persuasiveness', kind='scatter')
# %%
