var Edge = require('./Edge.js');

/**
 * class DMEdge
 * 
 * Encapsulates an edge with a count for multiple edges across the 
 * same vertices. 
 */
class DMEdge extends Edge {
  constructor(edge){
    if(edge instanceof DMEdge){
      super(arguments);
      Object.assign(this, edge);
      return this;
    }
    
    if(arguments[0] instanceof Edge){
      super(edge.source, edge.target);
      edge.coarser = this;
      this.finer = edge;
    }else{
      super(...arguments);
    }
    
    

    this.count = 0;
  }
  
  toString(){
    return `DMEdge#${this.id}(${this.source.id},${this.target.id})`;
  }
}

module.exports = DMEdge;
