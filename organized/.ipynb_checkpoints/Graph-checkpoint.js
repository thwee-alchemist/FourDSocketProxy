var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');
var THREE = require('three');
var BHN3 = require('./BHN3.js');

/*
 * Graph class
 * 
 * All operations that don't naturally belong to Vertex or Edge
 * are issued here. 
 */
class Graph {
  
  /*
    constructor
    
    defines a set V and a set E for vertices and edges, respectively. 
  */
  constructor(other){
    if(other instanceof Graph){
      Object.assign(this, other);
      return this;
    }
    
    this.id = ++Graph.id; // anew should be a keyword
    this.V = new Set();
    this.E = new Set();
    
    return this;
  }
  
  /*
    add(vertex|edge)
    
    Adds to the graph a vertex or edge passed into this function. 
  */
  add(vertex_or_edge){
    if(vertex_or_edge instanceof Vertex){
      var vertex = vertex_or_edge;
      this.V.add(vertex);
    }
    
    if(vertex_or_edge instanceof Edge){
      var edge = vertex_or_edge;
      this.E.add(edge);
      
      if(!this.V.has(edge.source)){
        this.V.add(edge.source);
      }
      
      if(!this.V.has(edge.target)){
        this.V.add(edge.target);
      }
    }
    
    return vertex_or_edge;
  }
  
  
  /*
    delete(vertex|edge)
    
    Removes from the graph a vertex or edge passed into this function. 
    
    When a vertex is removed, its incident edges are removed, as well. 
    When an edge is removed, its references in its incident vertices are removed, 
    as well. 
  */
  delete(vertex_or_edge){
    if(typeof vertex_or_edge == "Vertex"){
      var vertex = vertex_or_edge;
      
      for(var edge in vertex.edges){
         edge.delete_from(this);
      }
      
      this.V.delete(vertex);
    }
    
    if(typeof vertex_or_edge == "Edge"){
      var edge = vertex_or_edge;
      edge.source.delete_from(this);
      edge.target.delete_from(this);
      this.E.delete(edge);
    }
    
    return vertex_or_edge;
  }
  
  toString(){
    return `Graph#${this.id}{|V|:${this.V.size},|E|:${this.E.size}}`;
  }
  
  get size(){
    return this.V.size + this.E.size;
  }
  
  get complexity(){
    return this.V.size / this.E.size;
  }
}
Graph.id = 0;

var edges = false;
Graph.prototype.layout = function(){

  // calculate repulsions
  var tree = new BHN3();
  var vertex, edge, v, e;

  for(v in this.V){
    vertex = this.V[v];
    vertex.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
    vertex.repulsion_forces = new THREE.Vector3(0.0, 0.0, 0.0);
    vertex.attraction_forces = new THREE.Vector3(0.0, 0.0, 0.0);

    tree.insert(vertex);
  }

  for(v in this.V){
    vertex = this.V[v];
    vertex.repulsion_forces = vertex.repulsion_forces || new THREE.Vector3();
    vertex.repulsion_forces.set(0.0, 0.0, 0.0);
    tree.estimate(
      vertex, vertex.repulsion_forces,
      BHN3.prototype.pairwise_repulsion
    );
  }

  // calculate attractions

  for(e in this.E){
    edge = this.E[e];

    var attraction = edge.source.object.position.clone().sub(
      edge.target.object.position
    );
    attraction.multiplyScalar(-1 * CONSTANTS.attraction);

    // attraction.multiplyScalar(edge.options.strength);

    if(edge.options.directed){
      var distance = edge.object.geometry.vertices[0].distanceTo(edge.object.geometry.vertices[1]);
      var gravity = new THREE.Vector3(0.0, CONSTANTS.gravity/distance, 0.0);
      attraction.add(gravity);
    }

    edge.source.attraction_forces.sub(attraction);
    edge.target.attraction_forces.add(attraction);
  }

  for(v in this.V){
    // update velocity
    vertex = this.V[v];
    if(vertex){
      var friction = vertex.velocity.multiplyScalar(CONSTANTS.friction);

      vertex.acceleration.add(
        vertex.repulsion_forces.clone().add(
          vertex.attraction_forces.clone().negate()
        )
      );
      vertex.acceleration.sub(friction);

      vertex.velocity.add(vertex.acceleration);
      vertex.object.position.add(vertex.velocity);
    }
  }

  for(e in this.E){
    edge = this.E[e];

    if(edge){  
      edge.object.geometry.dirty = true;
      edge.object.geometry.__dirty = true;
      edge.object.geometry.verticesNeedUpdate = true;
    }
  }

  this.center = tree.center();
};

module.exports = Graph;
