var THREE = require('three');
var Range = require('./Range.js');



/**
 * class Vertex
 * 
 * defines: 
 *  - constructor(Data)
 *  - add_to(Graph)
 *  - remove_from(Graph)
 * see details below. 
 * 
 * This is the msot basic storage class of our data structure. 
 */
class Vertex {

  /** 
   * Vertex(Data)
   * 
   * Assigns data to the vertex, assigns an id to the vertex. Creates a property 
   * called edges, a set in which to hold incident edges. 
   */
  constructor(data){
    if(data instanceof Vertex){
      Object.assign(this, data);
      return this;
    }
    
    this.data = data;
    this.id = ++Vertex.id;
    this.t = new Range(0, 0);
    
    this.edges = new Set();
    
    this.object = {
      position: new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      )
    }
    
    return this;
  }
  
  union(other){
    return new DMVertex(this, other);
  }
  
  /**
   * add_to(Graph)
   * 
   * Adds this vertex to a graph. 
   */
  add_to(graph){
    graph.add(this);
    return this;
  }
  
  /**
   * delete_from(Graph)
   * 
   * Removes this vertex from the graph.
   */ 
  delete_from(graph){
    graph.delete(this);
    return this;
  }
  
  toString(){
    return `Vertex#${this.id}`;
  }
}
Vertex.id = 0;

module.exports = Vertex;

