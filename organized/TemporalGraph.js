//var Graph = require('./Graph.js');
var Util = require('./Util.js');
var Range = require('./Range.js');
var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');


class TemporalGraph{
  constructor(graph, range=new Range(0, 1)){
    this._t = range;
    this.ts = new Map();
    this.ts.set(range, graph);
    
    this.V = new Set();
    this.E = new Set();
    
    this.graph = graph;
    this.layout = graph.layout;
    
    this.id = ++TemporalGraph.id;
    
    return this;
  }
  
  set t(range){
    var old = Util.deepClone(this);
    this._t = range;
    
    this.V = new Set([...this.graph.V].filter(v => range.contains(v.t)));
    this.E = new Set([...this.graph.E].filter(e => range.contains(e.t)));
    
    return new DifferenceGraph(old, {V: this.V, E: this.E});
  }
  
  get t(){
    return this._t;
  }
  
  add(element){
    element.t = this._t;
    this.graph.add(element);
    if(element instanceof Vertex){
      this.V = new Set([...this.graph.V].filter(v => this._t.contains(v.t)));
    }
    if(element instanceof Edge){
      this.E = new Set([...this.graph.E].filter(e => this._t.contains(e.t)));
    }


  }
  
  delete(element){
    this.graph.delete(element);
  }
  
  toString(){
    return `TemporalGraph#${this.id}{|V|:${this.V.size},|E|:${this.E.size}}`;
  }
  
  get size(){
    return this.V.size + this.E.size;
  }
  
  get complexity(){
    return this.V.size / this.E.size;
  }

  toArray(){
    return [...this.ts.values()].sort(function(a, b){ return a.t.avg() - b.t.avg(); });
  }
}
TemporalGraph.id = 0;

module.exports = TemporalGraph;
