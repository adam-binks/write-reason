import os
import itertools
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

LATEX_MODE = False


if LATEX_MODE:
    # setup matplotlib for latex export
    matplotlib.use("pgf")
    matplotlib.rcParams.update({
        "pgf.texsystem": "pdflatex",
        'text.usetex': True,
        'pgf.rcfonts': False,
        # 'text.latex.preamble': r'\usepackage{libertine}',
        'font.size': 2,
        # 'font.family': 'Linux Libertine',
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

map_features = [
    'Fact sheet content (quoted)',
    'Fact sheet content (paraphrased)',
    'Fact sheet content',
    'Original ideas',
    'Issue node (topic statement)',
    'Issue node (question)',
    'Issue node (stance)',
    'Issue node',
    'Arg relations: arrow colour (local)',
    'Arg relations: arrow colour (global)',
    'Arg relations: arrow colour (unclear)',
    'Arg relations: arrow colour',
    'Arg relations: pro/con connected',
    'Arg relations: clustering',
    'Arg relations',
    'Provenance',
    'Other relations',
    'Planning essay order',
    'Representing task requirements',
]

text_kinds = [
    'Essay struc list',
    'Fact sheet repro',
    'Essay',
]

essaywriting_frequency = [
    'Most days',
    '1-2x weekly',
    '1-2x monthly',
    'Rarely',
    'Never',
]

# these are not boolean, they are a count of number of transformations with this property
# so could equal 2 if the participant did 2 transformations with that property
transformation_properties = [
    'Num transformations',
    'Interleaving',
    'Batching',
    'Paper',
    'More explicit',
    'Same explicit',
    'Less explicit',
    'One-to-many',
    'One-to-one',
]

# out of date columns, from earlier iterations of our grounded theory
defunct_cols = [
    'Copied fact sheet',
    'Shallow graph',
    'approach (from interview)',
    'Stance: not consistently repr',
    'Relations: stance',
    'Relations: sources',
    'Relations: unused',
    'Node: structure markers',
    'Node: repr process',
    'Int: index fact sheet',
    'Int: order essay',
    'Int: jot key facts',
    'Int: map arg relations',
    'Int: map global stance',
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
    'Sections',
    'start',
    'middle',
    'end',
    'Unnamed: 76',
    'Unnamed: 77',
    'Unnamed: 78',
]

bool_cols = list(itertools.chain(map_features, text_kinds, essaywriting_frequency))

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

# load data about time spent
new_cols = {a: [] for a in [
    'Graph time', 'Doc time', 'Mixed time', 'No interaction time', 'Total interaction time'
]}

DIR_LOGS = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\logs"

# temp - skip timeseries for speed
# for participant_id in df['Participant']:
#     fname = f'logs {participant_id}.json'
#     print(f'loading {fname}')
#     with open(os.path.join(DIR_LOGS, fname), 'r', encoding="utf8") as f:
#         data = json.load(f)
#         ts_df = timeseries.load_timeseries_data(data)
#         activity = timeseries.calculate_df_time_totals(ts_df)
#         counts = activity.value_counts()
        
#         num_minutes_per_activity_tick = 0.5  # 30 seconds

#         new_cols['Graph time'].append(counts['Graph'] * num_minutes_per_activity_tick)
#         new_cols['Doc time'].append(counts['Doc'] * num_minutes_per_activity_tick)
#         new_cols['Mixed time'].append(counts['Mixed'] * num_minutes_per_activity_tick)
#         new_cols['No interaction time'].append(counts['None'] * num_minutes_per_activity_tick)
#         new_cols['Total interaction time'].append((counts['Graph'] + counts['Doc'] + counts['Mixed']) * num_minutes_per_activity_tick)
    
# for col, contents in new_cols.items():
#     df[col] = contents


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

df['Average score'] = df[score_cols].mean(axis=1)

df = df.drop(columns=defunct_cols)

# %%

corr = df.corr()[score_cols]

f, ax = plt.subplots(figsize=(14, 12))
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(round(corr, 2), cmap="coolwarm", square=True, ax=ax, cbar_kws={"shrink": .5}, 
            mask=mask, vmin=-1, vmax=1, linewidths=.5,)





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

# new stats:

arg_series = df['Argumentation map']
struc_series = df['Essay structure graph']

arg = df[arg_series == 1 & struc_series == 0]
struc = df[arg_series == 0 & struc_series == 1]
both = df[arg_series == 1 & struc_series == 1]

stats.bartlett()


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

df['Nodes in text proportion'] == 1

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

ax.plot([0, 90], [0, 90], color='#a2cb90', lw=.2)

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

bucketed_by_avg_score = []
legend= []
for i in range(5, 11): # starting at 4 is ok because no avg scores below that
    bucketed_by_avg_score.append(list(df[(df['Average score'] >= i - 1) & 
                                 (df['Average score'] < i)][depth]))
    legend.append(f'{i}')

colors = sns.color_palette('crest').as_hex()

fig = plt.figure(figsize=(3.5, 2))
plt.hist(bucketed_by_avg_score, stacked=True, 
    color=colors,
    label=legend)

plt.xlabel("Depth-first proportion")
plt.ylabel("Frequency")

from matplotlib.lines import Line2D
handles = [Line2D([0], [0], marker='o', color='w', label=legend[i],
    markerfacecolor=colors[i], markersize=8) for i in range(len(legend))]

lgd = fig.legend(prop={'size': 10}, title="Average score", handles=handles, 
    bbox_to_anchor=(.95, 1), loc='upper left')

plt.tight_layout()

plt.savefig(f'figs/depth_first_hist.pgf', bbox_extra_artists=[lgd], bbox_inches='tight', dpi=1000)
# %%
df.corr()
# %%
df.plot(x=depth, y='Obj-resp', kind='scatter')
df.plot(x=breadth, y='Overall', kind='scatter')