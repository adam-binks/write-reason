# %%
import os
import json
import random
import numpy as np
import pandas as pd
import seaborn as sns

# %%

def get_node_with_order(order, nodes):
    return get_node(order, 'annotatedOrder', nodes)

def get_node(val, attr, nodes):
    for node in nodes:
        if attr in node.keys() and node[attr] == val:
            return node
    
    raise ValueError(f'Could not find node with {attr} = {val}')

def get_connected_nodes(node, arrows, nodes, out_or_in):
    look_for = 'origin' if out_or_in == 'outgoing' else 'destination'
    other_one = 'origin' if look_for == 'destination' else 'destination'
    
    connected = []
    for arrow in arrows:
        if arrow[look_for] == node['id']:
            connected.append(get_node(arrow[other_one], 'id', nodes))

    return connected

def get_unvisited(some_nodes, current_order, permit_current=False):
    # ignored nodes that have no annotatedOrder (are never mentioned in the essay)
    return [n for n in some_nodes if 'annotatedOrder' in n.keys() and 
            (n['annotatedOrder'] > current_order or (n['annotatedOrder'] == current_order and permit_current))]

def get_visited(some_nodes, current_order):
    # ignored nodes that have no annotatedOrder (are never mentioned in the essay)
    return [n for n in some_nodes if 'annotatedOrder' in n.keys() and n['annotatedOrder'] < current_order]

def get_depth_first_next_nodes(node, current_order, nodes, arrows):
    out_all = get_connected_nodes(node, arrows, nodes, "outgoing")
    out_unvisited = get_unvisited(out_all, current_order)
    if out_unvisited:
        return out_unvisited
    
    # need to go back up the tree
    in_all = get_connected_nodes(node, arrows, nodes, "incoming")
    in_unvisited = get_visited(in_all, current_order)  # only visited because we're going back up
    permitted = []
    
    # search all incoming unvisited nodes, because all are permissible in depth first
    for in_node in in_unvisited:
        permitted.extend(get_depth_first_next_nodes(in_node, current_order, nodes, arrows))
    
    return permitted

def get_breadth_first_next_nodes(node, current_order, nodes, arrows):
    all_roots = get_root_nodes(node, current_order, nodes, arrows, [], 0)
    shallowest_roots, rel_depth = get_shallowest(all_roots)

    # might be multiple roots at equal depth, it's a graph not a tree
    for root in shallowest_roots:
        permitted = []
        one_deeper = []
        get_permitted_at_depth(root, current_order, nodes, arrows, rel_depth, [], permitted, one_deeper)
    
    if permitted:
        return permitted
    else:
        # fully visited this depth so can go one level deeper
        return one_deeper

def get_permitted_at_depth(node, current_order, nodes, arrows, rel_depth, traversed, permitted, one_deeper):
    traversed.append(node)

    out_all = get_connected_nodes(node, arrows, nodes, "outgoing")
    out_all = [n for n in out_all if n not in traversed]

    out_unvisited = get_unvisited(out_all, current_order)

    if rel_depth == 0:
        # children are one deeper
        one_deeper.extend(out_unvisited)
        return

    if rel_depth == -1:
        # children are at rel_depth 0, so add unvisited ones to permitted
        permitted.extend(out_unvisited)
        # we should still explore the visited ones to populate one_deeper
    
    out_visited = get_visited(out_all, current_order)
    for out_node in out_visited:
        get_permitted_at_depth(out_node, current_order, nodes, arrows, rel_depth + 1, traversed.copy(),
                               permitted, one_deeper)

def get_shallowest(roots):
    shallowest = 0
    nodes = []
    for node, rel_depth in roots:
        if rel_depth == shallowest:
            nodes.append(node)
        elif rel_depth < shallowest:
            shallowest = rel_depth
            nodes = [node]
    
    return nodes, shallowest

def get_root_nodes(node, current_order, nodes, arrows, traversed, rel_depth):
    traversed.append(node)
    in_all = get_connected_nodes(node, arrows, nodes, "incoming")
    in_all = [n for n in in_all if n not in traversed]
    in_visited = get_visited(in_all, current_order)

    roots = []
    if not in_visited:
        roots.append((node, rel_depth))
    else:
        for incoming_node in in_visited:
            roots.extend(get_root_nodes(incoming_node, current_order, nodes, arrows,
                         traversed, rel_depth-1))

    return roots
    

def node_to_string(node):
    return f'{node["id"]} - {node["shortText"][:40]}'

def analyse_order(save, print_details=False):
    nodes = save['graph_value']['nodes']
    arrows =  save['graph_value']['connections']['arrows']

    results = {'breadth first': [], 'depth first': []}

    i = 1
    while True:
        try:
            node = get_node_with_order(i, nodes)
            next_node = get_node_with_order(i+1, nodes)
        except ValueError:
            # we've reached the end
            if print_details:
                print(f'Reached the end! Last node: {i}')
            break

        predicted = {
            'breadth first': get_breadth_first_next_nodes(node, i, nodes, arrows),
            'depth first': get_depth_first_next_nodes(node, i, nodes, arrows)
        }

        if print_details:
            print(f'this: {node_to_string(node)}')
            newline = "\n"
            for algo, prediction in predicted.items():
                if algo == 'depth first':
                    continue
                print(f'predicted {algo}: [\n{newline.join([node_to_string(p) for p in prediction])}\n]')
            print(f'actual: {node_to_string(next_node)}\n\n')

        for algo, prediction in predicted.items():
            results[algo].append(True if (next_node in prediction) else False)

        i += 1
    
    return results


def summarise_results(all_results):
    for algo, results in all_results.items():
        successes = sum(results)  # add the number of Trues in the results
        print(f'{algo}: {successes}/{len(results)}, {successes/len(results)}')


DIR = r"C:\Users\jelly\OneDrive - University of St Andrews\Summer study\order_logs"

for fname in ['logs 14.json__order_annotated.json']: # os.listdir(DIR):
    print(f'\n{fname}')
    with open(os.path.join(DIR, fname), 'r', encoding="utf8") as f:
        save = json.load(f)
        results = analyse_order(save, print_details=True)
        summarise_results(results)
