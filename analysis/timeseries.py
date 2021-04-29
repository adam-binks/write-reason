# %%
import os
import json
import random
import datetime

import numpy as np
import pandas as pd
import seaborn as sns

def plot_df(df, title=''):
    one_hot = pd.get_dummies(df['event_type'])
    df_xp = df.join(one_hot)

    totals = df_xp.resample('5min', on='timestamp').sum()

    exclude = [
        'event_type',
        'timestamp',
        # 'arrow_create',
        'arrow_delete',
        'add_arrow_type',
        'arrow_set_type',
        'update_arrow_colour',
        'cut',
        'copy',
        'delete_arrow_type',
        'doc_create_from_node',
        'node_create_from_doc',
        'doc_node_change_format',
        'doc_node_delete',
        # 'document_content_changed',
        'document_content_markdown',
        # 'node_create',
        'node_delete',
        'node_edit_short_text',
        'paste',
        'reorder',
        'save',
        'session_start'
    ]

    excluded = totals.loc[:, totals.columns.difference(exclude)]

    excluded.plot(figsize=(30,5), title=title).legend(bbox_to_anchor=(1,1))


def calculate_df_time_totals(df):
    one_hot = pd.get_dummies(df['event_type'])
    df_xp = df.join(one_hot)

    totals = df_xp.resample('30S', on='timestamp').sum()  # 30 seconds - matches frequency of document check

    graph_events = ['arrow_create', 'arrow_delete', 'arrow_set_type', 'node_create', 'node_delete', 'node_edit_short_text']
    mixed_events = ['doc_create_from_node', 'save', 'session_start']
    doc_events = ['doc_node_change_format', 'document_content_changed']

    for l in [graph_events, mixed_events, doc_events]:
        rem = []
        for item in l:
            if item not in list(totals):
                rem.append(item)
        for r in rem:
            l.remove(r)

    def activity_type(row):
        graph = any([c in row.keys() and row[c] > 0 for c in graph_events])
        mixed = any([c in row.keys() and row[c] > 0 for c in mixed_events])
        doc = any([c in row.keys() and row[c] > 0 for c in doc_events])

        if mixed or (graph and doc):
            return "Mixed"
        elif graph:
            return "Graph"
        elif doc:
            return "Doc"
        else:
            return "None"

    totals['activity'] = totals.apply(lambda row: activity_type(row), axis=1)
    # print(totals['activity'].value_counts())

    # one_hot = pd.get_dummies(totals['activity'])
    # totals = totals.join(one_hot)
    # totals[['Mixed', 'Doc', 'Graph']].plot(figsize=(30,5), title='activity').legend(bbox_to_anchor=(1,1))

    return totals['activity']


def load_timeseries_data(data):
    entries = []
    cols = ['event_type', 'timestamp']
    prev_text = ''
    for events in data['projects'][0]['log']['events'].values():
        for event in events:
            entries.append([event['type'], pd.to_datetime(event['timestamp'])])
            
            # add a new calculated event for when document content is changed
            if event['type'] == 'document_content_markdown':
                if event['content'] != prev_text:
                    entries.append(['document_content_changed', pd.to_datetime(event['timestamp'])])

                    prev_text = event['content']
    
    df = pd.DataFrame(np.array(entries), columns=cols)
    df.astype({'event_type': 'category'})
    df.set_index('timestamp')
    
    return df

def calculate_total_time_in_write_reason(data, log=False):
    df = load_timeseries_data(data)
    df = df[df['event_type'] != 'document_content_markdown']

    events_unsorted = df.to_dict('records')
    # order by timestamp
    events = sorted(events_unsorted, key=lambda k: k['timestamp'].to_pydatetime()) 

    def print_if_logging(s):
        if log:
            print(s)

    start_time = events[0]['timestamp']
    print_if_logging(f'start {start_time} at {events[0]["event_type"]}')
    total_time = datetime.timedelta(0)
    prev_event = None
    
    def interval_too_big(event, prev_event):
        MAX_INTERVAL = datetime.timedelta(minutes=15)
        return (event['timestamp'].to_pydatetime() - prev_event['timestamp'].to_pydatetime()) > MAX_INTERVAL

    for event in events:
        if prev_event and (event['event_type'] == 'session_start' or event == events[-1] or interval_too_big(event, prev_event)):
            end_event = event if event == events[-1] else prev_event

            if end_event['event_type'] != 'session_start':
                end_time = end_event['timestamp'].to_pydatetime()
                interval = end_time - start_time
                total_time += interval
                print_if_logging(f'end   {end_time} at {end_event["event_type"]}, interval {interval}')
            else:
                print_if_logging('end   skipped - session_start')

            start_time = event['timestamp'].to_pydatetime()
            print_if_logging(f'start {start_time} at {event["event_type"]}')
        
        prev_event = event
    
    return total_time

if __name__ == "__main__":
    DIR = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\logs"

    i = 0

    dfs = {}
    total_time = datetime.timedelta(0)
    for fname in os.listdir(DIR):
        print(f'loading {fname}')
        with open(os.path.join(DIR, fname), 'r', encoding="utf8") as f:
            data = json.load(f)
            time = calculate_total_time_in_write_reason(data, log=False)
            total_time += time
            print(f'time spent - {fname}: {time}')

            # df = load_timeseries_data(data)

            # dfs[fname] = df
            # calculate_df_time_totals(df)
        
        print(f'grand total time spent: {total_time}')