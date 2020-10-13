import os
import json
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

import timeseries
import graph_ordering

# %%

sns.set()

score_cols = [
    'Clarity',
    'Persuasiveness',
    'Structure',
    'Obj-resp',
    'Overall'
]

def run_ttest(df_a, df_b, col, should_print=True, decimal_places=3, ttest=stats.ttest_ind):
    a = df_a[col]
    b = df_b[col]
    ttest_result = ttest(a, b)
    if should_print:
        print(f't({int(len(a))-1})={round(ttest_result.statistic, decimal_places)}'
              f', p={round(ttest_result.pvalue, decimal_places)}\n')
    
    return ttest_result

def group_and_bar(col, val1=False, val2=True, numerical_cols=score_cols, stacked=False):
    group = df.groupby(col)
    ax = group.mean()[numerical_cols].plot(
            kind='bar',
            stacked=stacked,
            yerr=group.std()[numerical_cols],
            capsize=2,
            rot=0
        )

    count = df[col].value_counts()
    ax.set_xticklabels([f'{v} ({count[v]})' for v in [val1, val2]])
    ax.legend(bbox_to_anchor=(1,1))
    plt.show()

    if val1 != False or val2 != True:
        print(f'ttest {val1} vs {val2}')
    
    sig = []
    for score in numerical_cols:
        result = run_ttest(df[df[col] == val1], df[df[col] == val2], score, should_print=False)
        if result.pvalue < 0.05:
            sig.append(f'{score} (p={result.pvalue})')
    
    if sig:
        print(f'↑ significant: ' + ', '.join(sig) + '\n')
    else:
        print('↑ no significant' + '\n')

# %%

DIR = r'C:\Users\jelly\OneDrive - University of St Andrews\Summer study'

df = pd.read_csv(os.path.join(DIR, 'graph_analysis.csv'))

bool_cols = [
    'Used graph',
    'Shallow graph',
    'Essay structure graph',
    'Argumentation map',
    'Cites sources',
    'Disconnected argumentation subgraphs',
    'Custom arrows',
    'Central node',
    'Yes/no nodes',
    'Used arrows',
    'Arrow types semantic value',
    'Tree structure',
    'Copied fact sheet',
    'Sections'
]

for col in bool_cols:
    # NB - does not preserve NaN
    df[col] = pd.Series(val == 1 for val in df[col])

cat_cols = [
    'Participant',
    'Pre-task',
    'Essay',
    'Interview'
]
for col in cat_cols:
    df[col] = df[col].astype('category')

df['Nodes in text proportion'] = df['Nodes in text'] / df['Total nodes']
df['Nodes in text proportion'] = df['Nodes in text proportion'].fillna(0)

df['Both graphs'] = df['Essay structure graph'] & df['Argumentation map']

df['Structure graph only'] = df['Essay structure graph'] & (~ df['Argumentation map'])

df['Argumentation map only'] = (~ df['Essay structure graph']) & df['Argumentation map']

bool_cols.extend(['Both graphs', 'Structure graph only', 'Argumentation map only'])

# load data about time spent
new_cols = {a: [] for a in [
    'Graph time', 'Doc time', 'Mixed time', 'No interaction time', 'Total interaction time'
]}

DIR_LOGS = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\logs"
for participant_id in df['Participant']:
    fname = f'logs {participant_id}.json'
    print(f'loading {fname}')
    with open(os.path.join(DIR_LOGS, fname), 'r', encoding="utf8") as f:
        data = json.load(f)
        ts_df = timeseries.load_timeseries_data(data)
        activity = timeseries.calculate_df_time_totals(ts_df)
        counts = activity.value_counts()
        
        num_minutes_per_activity_tick = 0.5  # 30 seconds

        new_cols['Graph time'].append(counts['Graph'] * num_minutes_per_activity_tick)
        new_cols['Doc time'].append(counts['Doc'] * num_minutes_per_activity_tick)
        new_cols['Mixed time'].append(counts['Mixed'] * num_minutes_per_activity_tick)
        new_cols['No interaction time'].append(counts['None'] * num_minutes_per_activity_tick)
        new_cols['Total interaction time'].append((counts['Graph'] + counts['Doc'] + counts['Mixed']) * num_minutes_per_activity_tick)
    
for col, contents in new_cols.items():
    df[col] = contents


# load node reports from additional analysis
with open(os.path.join(DIR, 'nodeReports.json'), 'r', encoding="utf8") as f:
    data = json.load(f)

    new_cols = {a: [] for a in [
        'linkedCharsProportion', 'linkedWordsProportion'
    ]}
    for participant_id in df['Participant']:
        report = data[f'logs {participant_id}.json']
        new_cols['linkedCharsProportion'].append(report['linkedCharsProportion'])
        new_cols['linkedWordsProportion'].append(report['linkedWordProportion'])

    for col, contents in new_cols.items():
        df[col] = contents

# load graph to text ordering data
depth_first, breadth_first = graph_ordering.get_graph_orderings(df['Participant'])
df['Depth first proportion'] = depth_first
df['Breadth first proportion'] = breadth_first

# %%

for col in ['Essay', 'Pre-task']:
    group_and_bar(col, val1="Multi-structural", val2="Relational")

group_and_bar("Interview", val1="Multistructural", val2="Relational")

# %%

sns.countplot(data=df, x='Essay structure graph', hue='Essay')
plt.show()
sns.countplot(data=df, x='Argumentation map', hue='Essay')
plt.show()

# %%

for col in bool_cols:
    group_and_bar(col)

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

df.hist('linkedWordsProportion', bins=20)
df.hist('Nodes in text proportion', bins=20)
plt.show()
sns.scatterplot(data=df, x='linkedWordsProportion', y='Nodes in text proportion', hue='Essay structure graph')
plt.show()

# %%
sns.histplot(data=df, x="linkedWordsProportion", hue="Argumentation map", multiple="stack")

for col in ['linkedWordsProportion', 'Nodes in text proportion']:
    run_ttest(df[df['Argumentation map'] == True], 
        df[df['Argumentation map'] == False],
        col)

# %%
df.plot(x='linkedWordsProportion', y='Overall', kind='scatter')
df.plot(x='Total nodes', y='Persuasiveness', kind='scatter')
# %%

df.plot(x='Total interaction time', y='Overall', kind='scatter')
df.plot(x='Graph time', y='Overall', kind='scatter')
df.plot(x='Doc time', y='Overall', kind='scatter')
df.plot(x='Graph time', y='Doc time', kind='scatter', figsize=(5,5), xlim=(0, 90), ylim=(0, 90))

# %%
time_cols = ['Total interaction time', 'Graph time', 'Doc time', 'Mixed time', 'No interaction time']
active_time_cols = ['Mixed time', 'Doc time' , 'Graph time']

for col in bool_cols:
    group_and_bar(col, numerical_cols=active_time_cols, stacked=True)

# %%

sns.swarmplot(data=df, y='Total interaction time', x='Argumentation map')
plt.show()
sns.swarmplot(data=df, y='Total interaction time', x='Essay structure graph')
plt.show()

# %%
depth = 'Depth first proportion'
breadth = 'Breadth first proportion'
df.hist(depth)
df.hist(breadth)
df.plot(x=depth, y=breadth, kind='scatter', figsize=(5,5))
sns.scatterplot(data=df, x=depth, y=breadth, hue='Essay structure graph')

# %%
df.plot(x=depth, y='Obj-resp', kind='scatter')
df.plot(x=breadth, y='Overall', kind='scatter')