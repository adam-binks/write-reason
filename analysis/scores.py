import os
import json
import pandas as pd
from scipy import stats
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

import timeseries
import graph_ordering

# %%
sns.set_style("whitegrid")
sns.despine()

# %%

# setup matplotlib for latex export
matplotlib.use("pgf")
matplotlib.rcParams.update({
    "pgf.texsystem": "pdflatex",
    'text.usetex': True,
    'pgf.rcfonts': False,
    'text.latex.preamble': r'\usepackage{libertine}',
    'font.size': 2,
    'font.family': 'Linux Libertine',
})

SMALL_SIZE = 8
MEDIUM_SIZE = 10
BIGGER_SIZE = 12

plt.rc('font', size=SMALL_SIZE)          # controls default text sizes
plt.rc('axes', titlesize=SMALL_SIZE)     # fontsize of the axes title
plt.rc('axes', labelsize=MEDIUM_SIZE)    # fontsize of the x and y labels
plt.rc('xtick', labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc('ytick', labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc('legend', fontsize=SMALL_SIZE)    # legend fontsize
plt.rc('figure', titlesize=BIGGER_SIZE)  # fontsize of the figure title

# %%

score_cols = [
    'Clarity',
    'Persuasiveness',
    'Structure',
    'Obj-resp',
    'Overall'
]

def save_fig(name):
    plt.savefig(f'figs/{name}.pgf', bbox_inches='tight', dpi=1000)

def run_ttest(df_a, df_b, col, should_print=True, decimal_places=3, ttest=stats.ttest_ind):
    a = df_a[col]
    b = df_b[col]
    ttest_result = ttest(a, b)

    df = int(len(a))- (2 if ttest == stats.ttest_ind else 1)

    report_string = f't({df})={round(ttest_result.statistic, decimal_places)}, '
    report_string += f'p={round(ttest_result.pvalue, decimal_places)}'
    if should_print:
        print(report_string)
    
    return ttest_result, report_string

def group_and_bar(col, val1=False, val2=True, numerical_cols=None, stacked=False, figsize=None, name=None, save=True):
    if numerical_cols is None:
        numerical_cols = score_cols
    if figsize is None:
        figsize=(3.5, 2.5)
    if name is None:
        name = col

    group = df.groupby(col)

    if numerical_cols == score_cols:
        ax = group.mean()[numerical_cols].plot(
            kind='bar',
            stacked=stacked,
            yerr=group.std()[numerical_cols],
            capsize=2,
            rot=0,
            figsize=figsize,
            ylim=(0, 10.5) # set the ylim for score_cols 0-10
        )
    else:
        ax = group.mean()[numerical_cols].plot(
                kind='bar',
                stacked=stacked,
                yerr=group.std()[numerical_cols],
                capsize=2,
                rot=0,
                figsize=figsize
            )

    count = df[col].value_counts()
    ax.set_xticklabels([f'{v} ({count[v]})' for v in [val1, val2]])
    ax.legend(bbox_to_anchor=(1,1))
    ax.grid(axis="x")
    if save:
        save_fig(name)

    if val1 != False or val2 != True:
        print(f'ttest {val1} vs {val2}')
    
    sig = []
    for score in numerical_cols:
        result, result_str = run_ttest(df[df[col] == val1], df[df[col] == val2], score, should_print=False)
        if result.pvalue < 0.05:
            s = f'{score} '
            for val in [val2, val1]:
                s += f'{val}: '
                score_vals = df[df[col] == val][score]
                s += f'M={round(score_vals.mean(), 2)}, '
                s += f'SD={round(score_vals.std(), 2)}. '

            sig.append(s + f'    {result_str}')
    
    if sig:
        print(f'↑ significant: ' + '\n'.join(sig) + '\n')
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

# group_and_bar('Essay structure graph', name='essay_struc_score', figsize=(3, 2))
group_and_bar('Argumentation map', name='arg_map_score', figsize=(3, 2))

# add significance bars
for offset, height in [(.205, 9.4), (-.205, 10.2)]:
    x1, x2 = 0 - offset, 1 - offset   # first and second clarity columns
    y, h, col = height, .2, 'k'
    plt.plot([x1, x1, x2, x2], [y, y+h, y+h, y], lw=1.5, c=col)
    plt.text((x1+x2)*.5, y+h-0.1, "*", ha='center', va='bottom', color=col)
save_fig('arg_map_score')

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

# %%

fig, ax = plt.subplots()
fig.set_size_inches(3, 3)
df['Average score'] = df[score_cols].mean(axis=1)
g = sns.scatterplot(data=df, ax=ax, x='Graph time', y='Doc time', hue='Average score',
    palette='crest')
g.set(xlim=(0, 90), ylim=(0, 90))

plt.xlabel("Map interaction time (minutes)")
plt.ylabel("Document interaction time (minutes)")
save_fig('graph_vs_doc_time')

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


df.hist(depth, figsize=(3.5, 2))
save_fig('depth_first_hist')

# df.hist(breadth)

# df.plot(x=depth, y=breadth, kind='scatter', figsize=(5,5))
# sns.scatterplot(data=df, x=depth, y=breadth, hue='Essay structure graph')
# %%
df.corr()
# %%
df.plot(x=depth, y='Obj-resp', kind='scatter')
df.plot(x=breadth, y='Overall', kind='scatter')