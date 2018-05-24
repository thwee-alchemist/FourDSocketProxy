class FourDMirror{
    constructor(){
      this.vertex_id = 0;
      this.edge_id = 0;
      this.vertices = new Set();
      this.edges = new Set();
      return this;
    }
  
    add_vertex(){
      var id = this.vertex_id++;
      this.vertices.add(id);
      return id;
    }
  
    remove_vertex(){
      this.vertices.delete(id);
    }
  
    add_edge(){
      var id = this.edge_id++;
      this.edges.add(id);
      return id;
    }
  
    remove_edge(id){
      this.edges.delete(id);
    }
  
    clear(){
      this.vertex_id = 0;
      this.edge_id = 0;
    
      this.vertices.clear();
      this.edges.clear();
    }
  }

  module.exports = FourDMirror;