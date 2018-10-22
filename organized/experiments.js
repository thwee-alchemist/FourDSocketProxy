var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');
var Graph = require('./Graph.js');
var DynamicMatching = require('./DynamicMatching.js');
var Util = require('./Util.js');

var graph = new Graph();
var dm = new DynamicMatching(graph, Util.LEVELS);

console_log = console.log;
console.log = function(){
  console_log(...[...arguments].map(arg => arg.toString()));
}


// the example from Dynamic Multilevel Graph Visualization

var v1 = new Vertex();
var v2 = new Vertex();
var v3 = new Vertex();
var v4 = new Vertex();
var v5 = new Vertex();
var v6 = new Vertex();
//console.log(v1);

graph.add(v1);
graph.add(v2);
graph.add(v3);
graph.add(v4);
graph.add(v5);
graph.add(v6);

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


graph.add(e6);
graph.add(e2);
graph.add(e3);
graph.add(e7);
graph.add(e5);
graph.add(e1);
graph.add(e4);

console.log(Util.print_all(graph, Util.also));

console.log('randomizing graph');
Util.randomize_graph(graph, 100, 500);
console.log(Util.print_all(graph, Util.also));

