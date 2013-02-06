import networkx as nx
import json
import matplotlib.cm as cm
import matplotlib.colors as colors
from networkx.readwrite import json_graph

G = nx.barabasi_albert_graph(250,1)
#G = nx.random_geometric_graph(256,.1)

cc = nx.closeness_centrality(G)
d = G.degree()
nd = nx.average_neighbor_degree(G)
eb = nx.edge_betweenness(G)
el = nx.edge_load(G)


min_cc = min(cc.values())
max_cc = max(cc.values())

for n in cc:
    cc[n] = (cc[n]-min_cc)/(max_cc-min_cc)

min_eb = min(eb.values())
max_eb = max(eb.values())

for e in eb:
    eb[e] = (eb[e]-min_eb)/(max_eb-min_eb)

min_el = min(el.values())
max_el = max(el.values())

for e in el:
    el[e] = (el[e]-min_el)/(max_el-min_el)

for n in G:
    G.node[n]['color'] = colors.rgb2hex(cm.winter(cc[n]))
    G.node[n]['border_color'] = colors.rgb2hex(cm.winter(1./(cc[n]+1)))
    G.node[n]['border_size'] = nd[n]**.5 + 1.5
    G.node[n]['size'] = d[n]**.5 + 5
    G.node[n]['label'] = str(n)

for (u,v) in G.edges():
    G.edge[u][v]['width'] = 1.5 + 5*eb[(u,v)]
    G.edge[u][v]['strength'] = G.edge[u][v]['width']
    G.edge[u][v]['color'] = colors.rgb2hex(cm.jet(el[(u,v)]))

data = json_graph.node_link_data(G)
s = json.dumps(data)
f = open('test.json','w')

f.write(s)
f.close()
