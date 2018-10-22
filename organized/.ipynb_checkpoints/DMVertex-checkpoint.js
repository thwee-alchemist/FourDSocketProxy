var Vertex = require('./Vertex.js');

/*g.add(new Edge(v1, v2))*/
/**
 * class DMVertex
 * 
 * Encapsulates a vertex with a set union operation
 */
class DMVertex extends Vertex {
  
  /**
   * new DMVertex(vertex1, vertex2, ...)
   * 
   * 
   */
  constructor(other){
    super(...arguments);
    
    if(other instanceof DMVertex){
      Object.assign(this, other);
      return this;
    }
    
    this.finer = new Set([...arguments]);
    [...this.finer].map(v => {
      v.coarser = this;
    });
    
    return this;
  }

  /**
   * 
   */
  union(dmvertex){
    return new DMVertex(this, dmvertex);
  }

  has(vertex){
    return this.finer.has(vertex) 
      || [...this.finer].some(v => {
        return (v == vertex) || ((v instanceof DMVertex) && v.finer.has(vertex))
      });
  }
  
  toString(){
    return `DMVertex#${this.id}`;
  }
}
DMVertex.all = new Set();

module.exports = DMVertex;