var Vertex = require('./Vertex.js');
var Range = require('./Range.js');


/*
 * The edge represents a connection between two vertices, here called source and
 * target. 
 */
class Edge {
  
  /*
   * new Edge(Vertex, Vertex, Data)
   * - the constructor
   * 
   * Adds itself to the target and source vertex, and stores data passed into it. 
   * Maintains a count to allow for multiple edges. Assigns a pseudo random order.
   */
  constructor(source, target, data){
    if(source instanceof Edge){
      Object.assign(this, source);
      return this;
    }
    
    console.assert(
      source instanceof Vertex, 
      `Edge::constructor requires a Vertex source.`
    );
    console.assert(
      target instanceof Vertex, 
      `Edge::constructor requires a Vertex target.`
    );
    
    this.source = source;
    this.target = target;
    this.data = data;
    this.t = new Range(0, 0);
    
    this.source.edges.add(this);
    this.target.edges.add(this);
    
    this.count = 0;
    this.order = Math.random();
    this.id = ++Edge.id;
    
    return this;
  }
  
  /*
   * Adds this edge to the specified graph. 
   */
  add_to(graph){
    graph.add(this);
    if(this.graphs){
      this.graphs.add(graph);
    }else{
      this.graphs = new Set([graph]);
    }
    return this;
  }
  
  /*
   * Removes this vertex from the specified graph.
   */
  delete_from(graph){
    graph.delete(this);
    this.graphs.delete(graph);
    
    return this;
  }
  
  /*
   * Retuns true if the two edges share a vertex. 
   */
  shares_vertex(other){
    return this.source == other.source 
      || this.source == other.target
      || this.target == other.source
      || this.target == other.target;
  }
  
  toString(){
    return `Edge#${this.id}(${this.source.id},${this.target.id})`;
  }
}
Edge.id = 0;

module.exports = Edge;