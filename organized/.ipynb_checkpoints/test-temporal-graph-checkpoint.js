
var DynamicMatching = require('./DynamicMatching.js');
var Util = require('./Util.js');
var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');
var Graph = require('./Graph.js');
var Range = require('./Range.js');
var TemporalGraph = require('./TemporalGraph.js');

var graph = new Graph();
var dm = new DynamicMatching(graph, 1);
var tgraph = new TemporalGraph(graph);
var tdm = new TemporalGraph(dm);


var v1 = new Vertex();
var v2 = new Vertex();
var v3 = new Vertex();
var v4 = new Vertex();
var v5 = new Vertex();
var v6 = new Vertex();
//console.log(v1);

tgraph.add(v1);
tgraph.add(v2);
tgraph.add(v3);
tgraph.add(v4);
tgraph.add(v5);
tgraph.add(v6);

var e1 = new Edge(v1, v2);
var e2 = new Edge(v1, v3);
var e3 = new Edge(v2, v4);
var e4 = new Edge(v3, v4);
var e5 = new Edge(v3, v5);
var e6 = new Edge(v4, v6);
var e7 = new Edge(v5, v6);

e1.order = 6;
e2.order = 2;
e3.order = 3;
e4.order = 7;
e5.order = 5;
e6.order = 1;
e7.order = 4;


tgraph.add(e6);
tgraph.add(e2);
tgraph.add(e3);
tgraph.add(e7);
tgraph.add(e5);
tgraph.add(e1);
tgraph.add(e4);

console.log(Util.print_all(tgraph));