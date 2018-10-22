//var Graph = require('./Graph.js');
var Util = require('./Util.js');
var _ = require('lodash');
var Range = require('./Range.js');


class TemporalGraph{
  constructor(graph){
    this._t = new Range(0, 0);
    this.ts = [];
    
    this.V = new Set();
    this.E = new Set();
    
    this.graph = graph;
    this.layout = graph.layout;
    
    this.id = ++TemporalGraph.id;
    
    return this;
  }
  
  set t(range){
    var old = Util.deepClone(this);
    this._t = range
    
    this.V = new Set([...this.graph.V].filter(v => range.contains(v.t)));
    this.E = new Set([...this.graph.E].filter(e => range.contains(e.t)));
    
    return new DifferenceGraph(old, {V: this.V, E: this.E});
  }
  
  get t(){
    return this._t;
  }
  
  add(element){
    element.t = this.t;
    this.graph.add(element);
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
}
TemporalGraph.id = 0;

module.exports = TemporalGraph;
