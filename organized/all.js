/**
 * JoAHU Marshall Moore
 * October 20, 2018
 * 
 * moore.joshua@pm.me
 */

var THREE = require('three');

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


var BHN3 = function(){
  this.inners = [];
  this.outers = {};
  this.center_sum = new THREE.Vector3(0, 0, 0);
  this.center_count = 0;
};

var CONSTANTS = {
  width: 1000,
  attraction: 0.05,
  far: 1000,
  optimal_distance: 10.0,
  minimum_velocity: 0.001,
  friction: 0.60,
  zoom: -25,
  gravity: 10, 
  BHN3: {
    inner_distance: 0.36,
    repulsion: 25.0,
    epsilon: 0.1
  }
};

BHN3.prototype.constants = CONSTANTS.BHN3;

BHN3.prototype.center = function(){
  return this.center_sum.clone().divideScalar(this.center_count);
};

BHN3.prototype.place_inner = function(vertex){
  this.inners.push(vertex);
  this.center_sum.add(vertex.object.position);
  this.center_count += 1;
};



BHN3.prototype.get_octant = function(position){
  var center = this.center();
  var x = center.x < position.x ? 'l' : 'r';
  var y = center.y < position.y ? 'u' : 'd';
  var z = center.z < position.z ? 'i' : 'o';
  return x + y + z;
};

BHN3.prototype.place_outer = function(vertex){
  var octant = this.get_octant(vertex.object.position);
  this.outers[octant] = this.outers[octant] || new BHN3();
  this.outers[octant].insert(vertex);
};

BHN3.prototype.insert = function(vertex){
  if(this.inners.length === 0){
    this.place_inner(vertex);
  }else{
    if(this.center().distanceTo(vertex.object.position) <= this.constants.inner_distance){
      this.place_inner(vertex);
    }else{
      this.place_outer(vertex);
    }
  }
};

BHN3.prototype.estimate = function(vertex, force, force_fn){
  if(this.inners.indexOf(vertex) > -1){
    for(var i=0; i<this.inners.length; i++){
      if(vertex !== this.inners[i]){
        var individual_force = force_fn(
          vertex.object.position.clone(),
          this.inners[i].object.position.clone()
        );

        force.add(individual_force);
      }
    }
  }else{
    var sumstimate = force_fn(vertex.object.position, this.center());
    sumstimate.multiplyScalar(this.center_count);
    force.add(sumstimate);
  }

  for(var octant in this.outers){
    this.outers[octant].estimate(vertex, force, force_fn);
  }
};

BHN3.prototype.pairwise_repulsion = function( x1, x2 ){

  var enumerator1, denominator1, 
    enumerator2, denominator2, 
    repulsion_constant, 
    difference, absolute_difference, 
    epsilon, product, 
    term1, term2,
    square, sum, result; 

  // first term
  enumerator1 = repulsion_constant = CONSTANTS.BHN3.repulsion;

  difference = x1.clone().sub(x2.clone());
  absolute_difference = difference.length();

  epsilon = CONSTANTS.BHN3.epsilon;
  sum = epsilon + absolute_difference;
  denominator1 = square = sum*sum;

  term1 = enumerator1 / denominator1;

  // second term
  enumerator2 = difference;
  denominator2 = absolute_difference;

  term2 = enumerator2.divideScalar(denominator2);

  // result
  result = term2.multiplyScalar(term1);  

  return result;
};


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


class Range {
  constructor(start, end){
    this.start = start;
    this.end = end;
    Range.all.add(this);
  
    return this;
  }
  
  copy(){
    return new Range(this.start, this.end);
  }
  
  release(){
    Range.all.delete(this);
  }
  
  begins_before(other){
    return this.start < other.end;
  }
  
  ends_after(other){
    return this.end > other.end;
  }
  
  begins_after(other){
    return this.start > other.start;
  }
  
  ends_before(other){
    return this.end < other.end;
  }
  
  avg(){
    return (this.start + this.end) / 2.0;
  }
  
  contains(other){
    if(other instanceof Number){
      return (this.start <= other) && (this.end >= other);
    }
    if(other instanceof Range){
      return (this.start <= other.start) && (this.end >= other.end);
    }
  }
}
Range.all = new Set();



// to store element and its priority
class QElement {
  constructor(element, priority)
  {
    this.element = element;
    this.priority = priority;
  }
}
 
// PriorityQueue class
class PriorityQueue {
 
  // An array is used to implement priority
  constructor(){
    this.items = [];
  }
  
  next(element){
    return this.items[this.items.indexOf(this.items.find(qe => qe.element == element)) + 1];
  }
  
  previous(element){
    return this.items[this.items.indexOf(this.items.find(qe => qe.element == element)) - 1];
  }

  /* 
    enqueue function to add element to the queue as per priority
  */
  enqueue(element, priority){
    // creating object from queue element
    var qElement = new QElement(element, priority);
    var contain = false;

    // iterating through the entire
    // item array to add element at the
    // correct location of the Queue
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > qElement.priority) {
        // Once the correct location is found it is
        // enqueued
        this.items.splice(i, 0, qElement);
        contain = true;
        break;
      }
    }

    // if the element have the highest priority
    // it is added at the end of the queue
    if (!contain) {
      this.items.push(qElement);
    }
  }

  /*
    dequeue method to remove element from the queue
  */
  dequeue(){
    // return the dequeued element
    // and remove it.
    // if the queue is empty
    // returns Underflow
    if (this.empty()) throw "Underflow";
    return this.items.shift().element;
  }

  empty(){
    // return true if the queue is empty.
    return this.items.length == 0;
  }
}


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


/**
 * class DynamicMatching
 * 
 * responsible for maintaining coarser and coarser versions of an
 * initially attached graph. 
 */
class DynamicMatching {
  /**
   * new DynamicMatching(base Graph|DynamicMatching, Integer)
   * 
   * - base specifies the base graph which is to be reduced, and to which this 
   *   dynamic matching should attach itself to, decorating add and delete in the base 
   *   object.
   * - n specifies how many levels of DynamicMatchings should be produced.
   * 
   * Instantiates the member variables id, finer, coarser, V (Map), E (Set) and pq. 
   */
  constructor(finer, n){
    this.id = ++DynamicMatching.id;
    
    this.finer = finer; // the base object
    
    finer.coarser = this; // a doubly linked list
    this.V = new Map(); // holds the vertices of this dynamic matching
    this.E = new Set(); // holds the edges of this dynamic matching
    this.pq = new PriorityQueue(); // ge
    
    this.m = new Map();
    
    if(n > 0){
      this.coarser = new DynamicMatching(this, --n);
    }
    
    if(finer){

      var finer_add = finer.add.bind(finer);
      var finer_delete = finer.delete.bind(finer);

      var that = this;
      console.log(`${this} rewiring ${finer}'s add and delete.`);
      finer.add = (entity) => {
        console.assert(entity, `entity must exist to be added to ${finer} and ${that}`);
        finer_add(entity);
        if(entity instanceof Edge){
          that.add(entity);
        }

        return entity;
      }

      finer.delete = (entity) => {
        console.assert(entity, `entity must exist to be removed from ${that} and ${finer}`);
        finer_delete(entity);
        that.delete(this.get_corresponding(entity));

        return entity;
      }
    }
    
    return this;
  }

  add(v_or_e){
    if(v_or_e instanceof Vertex){
      var vertex = v_or_e;
      this.add_vertex(vertex);
    }
    if(v_or_e instanceof Edge){
      var edge = v_or_e;
      this.add_edge(edge);
    }
    
    this.process_queue();
    return v_or_e;
  }

  /*
    Adds a new DMVertex for the supplied base vertex.
  */
  add_vertex(v){
    
    // "No action needed."
    /*
    if(!this.get_corresponding(v)){
      this.V.set(vertex, new DMVertex(v));
    }
    */
  }

  get_corresponding_edge(e){
    var e_prime = [...this.E].find(e_prime => {
      return e_prime.source.has(e.source) 
        || e_prime.target.has(e.target)
        || e_prime.source.has(e.target)
        || e_prime.target.has(e.source);
    });

    if(!e_prime){
      e_prime = new DMEdge(
        this.get_corresponding(e.source),
        this.get_corresponding(e.target)
      );
      this.E.add(e_prime);
    }

    return e_prime;
  }
  
  get_corresponding_vertex(v){
    var v_prime = this.V.get(v);
    if(!v_prime){
      v_prime = new DMVertex(v);
      this.V.set(v, v_prime);
    }
    return v_prime;
  }
  
  get_corresponding(v_or_e){
    if(v_or_e instanceof Vertex){
      return this.get_corresponding_vertex(v_or_e);
    }
    
    if(v_or_e instanceof Edge){
      return this.get_corresponding_edge(v_or_e);
    }
  }

  add_edge(e){
    // "Increase the count of (v1', v2') in E' possibly adding an edge..."
    var v1_prime = this.get_corresponding(e.source);
    var v2_prime = this.get_corresponding(e.target);
    
    var e_prime = this.get_corresponding(e);
    if(e_prime){
      e_prime.count++;
    }else{
      e_prime = new DMEdge(v1_prime, v2_prime);
      this.E.add(e_prime);
    }
    
    // "add e to the queue"
    this.pq.enqueue(e, e.order);
  }

  delete(v_or_e){
    //console.log(`Dynamic Matching ${this.id} deleting ${v_or_e}`);

    if(v_or_e instanceof Vertex){
      var vertex = v_or_e;
      return this.delete_vertex(vertex);
    }

    if(v_or_e instanceof Edge){
      var edge = v_or_e;
      return this.delete_edge(edge);
    }
    
    return v_or_e;
  }

  delete_vertex(v){
    [...v.edges].map(e => this.delete(this.get_corresponding(e)));
    this.V.delete(v);
  }

  delete_edge(e){
    // "If e is in the matching, then unmatch(e)"
    var e_prime = [...this.E].find(e_prime => {
      var v1_prime = e_prime.source;
      var v2_prime = e_prime.target;
      return v1_prime.has(e.source) 
        && v2_prime.has(e.target);
    });

    if(e_prime){
      this.unmatch(e);
      
      e_prime.count--;
      if(e_prime.count == 0){
        this.delete(e_prime);
      }

      console.log(`${e}>${e.source}>${e.source.edges.size} E`);
      if(e.source.edges.size == 0){
        this.delete(this.get_corresponding(e.source));
      }
      
      console.log(`${e}>${e.target}>${e.target.edges.size} E`);
      if(e.target.edges.size == 0){
        this.delete(this.get_corresponding(e.target));
      }
    }

    [...this.E]
    .filter(edge => this.depends(e, edge))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  depends(e1, e2){
    // "e1 -> e2 === (e1 < e2) and e1 S e2"
    var priority = e1.order < e2.order;
    var share_vertex = e1.shares_vertex(e2);

    return priority && share_vertex;
  }
  
  match(e){
    console.assert(e instanceof Edge, `DM::match didn't receive a Edge`);
    console.assert(e.source instanceof Vertex, `DM::match received a Edge but it doesn't have a Vertex as source`);
    console.assert(e.target instanceof Vertex, `DM::match received a Edge but it doesn't have a Vertex as target`);
    
    console.log(`DM#${this.id} matching ${e}`);

    // For each edge e' where e -> e', if e' is matched then
    // unmatch(e').
    [...this.E]
    .filter(e2 => this.depends(e, e2) && this.get_corresponding(e2))
    .map(e2 => this.unmatch(e2));
    
    // Delete vertices v1_coarse and v2_coarse from the coarser graph.
    var v1_prime = this.get_corresponding(e.source);
    var v2_prime = this.get_corresponding(e.target);
    this.delete(v1_prime);
    this.delete(v2_prime);

    // Create a new vertex v1 U v2 in G'. 
    var v1_u_v2 = new DMVertex(e.source, e.target);
    this.add(v1_u_v2);

    // For all edges e = (v, v') in G incident on v1 or v2
    // (but not both), add a corresponding edge to or from v1 U v2
    // in G'.
    [...e.source.edges]
    .filter(edge => edge != e)
    .map(edge => {
      var other_vertex = new DMVertex(edge.source);
      var corresponding_edge = new DMEdge(other_vertex, v1_u_v2);
      this.add(other_vertex);
      this.add(corresponding_edge);
    });
    [...e.target.edges]
    .filter(edge => edge != e)
    .map(edge => {
      var other_vertex = new DMVertex(edge.target);
      var corresponding_edge = new DMEdge(v1_u_v2, other_vertex);
      this.add(other_vertex);
      this.add(corresponding_edge);
    });

    [...this.E]
    .filter(edge => this.depends(edge, e))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  unmatch(e){
    console.log(`DM ${this.id} unmatching ${e}`);

    // "Delete any edges in G' incident on v1_u_v2."
    var v1_u_v2 = this.get_corresponding(e.source);
    console.assert(v1_u_v2, `v1_u_v2 not found`)
    console.assert(v1_u_v2 == this.get_corresponding(e.target), `sanity`);

    [...v1_u_v2.edges]
    .map(incident_edge => this.delete(incident_edge));

    
    // "Delete the vertex v1_u_v2 from G'"
    this.delete(v1_or_v2);
    
    // "Add new vertices v1_prime and v2_prime to G'"
    this.V.set(e.source, new DMVertex(e.source));
    this.V.set(e.target, new DMVertex(e.target));
    
    // "For each edge incident on v1 or v2 in G add a corresponding edge to G'"
    [...e.source.edges]
    .map(edge => this.add(new DMEdge(
      this.get_corresponding(e.source),
      this.get_corresponding(edge.source == e.source ? edge.target : edge.source)
    )));
    [...e.target.edges]
    .map(edge => this.add(new DMEdge(
      this.get_corresponding(e.target),
      this.get_corresponding(edge.target == e.target ? edge.source : edge.target)
    )));

    // "For each e' such that e -> e', add e' to the queue."
    [...this.E]
    .filter(edge => this.depends(e, edge))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  match_equation(e){
    if(this.E.size == 0){
      console.log('because empty');
      return true;
    }
    
    // "... e is matched if and only if there is no edge e' element M
    // such that e' -> e."
    var m = [...this.E]
    .every(edge => !this.depends(edge, e));
    this.m.set(e, m);

    return m;
  }

  process_queue(){
    while(!this.pq.empty()){
      var e = this.pq.dequeue();
      console.assert(e instanceof Edge, `pq didn't return an Edge`);
      var m = this.match_equation(e);
      if(m != this.m.get(e)){
        if(m){
          this.match(e);
        }else{
          this.unmatch(e);
        }
      }
    }
  }

  toString(){
    return `DynamicMatching#${this.id}{|V|:${this.V.size},|E|:${this.E.size}}`;
  }
  
  get size(){
    return this.E.size + this.V.size;
  }
  
  get complexity(){
    return this.V.size / this.E.size;
  }
}
DynamicMatching.id = 0;


class TemporalGraph{
  constructor(graph){
    this._t = new Range(0, 0);
    this.ts = [];
    
    this.graph = graph;
    this.layout = graph.layout;
    
    this.V = new Proxy(graph.V, {
      set: V => this.graph.V = V,
      has: v => this.V.has(v),
      get: (target, prop) => {
        return new Set([...this.graph.V].filter(v => this._t.contains(v._t)))
      }
    });
    
    this.E = new Proxy(graph.E, {
      set: E => this.graph.E = E,
      has: e => this.E.has(e),
      get: (target, prop) => new Set([...this.graph.E].filter(e => this._t.contains(e._t)))
    });
    
    this.id = ++TemporalGraph.id;
    
    return this;
  }
  
  set t(range){
    var old = Util.deepClone(this);
    
  }
  
  get t(){
    return this._t;
  }
  
  add(element){
    element.t = this.t;
    graph.add(element);
  }
  
  delete(element){
    graph.delete(element);
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

var LEVELS = 0;

/**
 * Graph|DynamicMatching coarser(Graph, Integer)
 * 
 * Retrieves the dynamic matching at the specified level, 
 * or the graph if supplied a level value of zero. 
 */
function coarser(base, level){
  if(level){
    return coarser(base.coarser, --level);
  }
  return base
}

var print_all = function(graph, also){
  var str = ``;
  for(var l=0; l<=LEVELS; l++){
    str += `${coarser(graph, l).toString()}\n`;
  }

  if(also instanceof Function){
    for(var l=0; l<=LEVELS; l++){
      str += `${also(coarser(graph, l)).toString()}\n`;
    }
  }
  
  return str;
}


/**
 * element choice(iterable)
 *
 * Returns a pseudorandom element from the iterable by converting it 
 * to an array and choosing a random element. 
 */
var choice = function(iterable){
  return [...iterable][Math.floor(iterable.size*Math.random())];
}

/**
 * randomize_graph(graph, v, e)
 * 
 * adds the specified number of vertices (v) and edges (e) to the graph. 
 */
var randomize_graph = function(graph, v, e){
  for(var i=0; i<v; i++){
    graph.add(new Vertex());
  }
  
  for(var i=0; i<e; i++){
    graph.add(new Edge(choice(graph.V), choice(graph.V)));
  }
  
  return graph;
}

var collect_all = function(graph, also){
  var ret = [];
  
  for(var l=0; l<LEVELS+1; l++){
    var obj = {};
    
    var g = coarser(graph, l);
    obj[`graph_V_size`] = g.V.size;
    obj[`graph_E_size`] = g.E.size;
    obj[`graph_size`] = g.size;
    obj[`graph_complexity`] = g.complexity;
    obj.level = l;
    
    ret.push(obj);
  }
  
  return ret;
}

var also = function(graph){
  graph_size = graph.size;
  
  try{
    coarser_size = graph.coarser ? graph.coarser.size : 1;
    finer_size = graph.finer ? graph.finer.size : 1;
  
    finer_ratio = graph_size / finer_size;
    coarser_ratio = graph_size / coarser_size;
  }catch(e){}
  
  return `
    ${graph}.size: ${graph.size}
    ${graph}.complexity: ${graph.complexity}
    ${graph}/${graph.coarser}: ${coarser_ratio}
    ${graph}/${graph.finer}: ${finer_ratio}
  `
}

function assign(target, varArgs, ) { // .length of function is 2
  'use strict';
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

/*
  set operations
*/
function union(a,b){ return new Set([...a, ...b]) }
function intersection(a, b){ return new Set([...a].filter(x => b.has(x))); }
function difference(a, b){ return new Set([...a].filter(x => !b.has(x))); }
function subtract(a, b){ 
  for(var e of b){
    a.delete(e);
  }
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function deep_assign(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deep_assign(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deep_assign(target, ...sources);
}
  
function deepClone(obj, hash = new WeakMap()) {
  if (Object(obj) !== obj) return obj; // primitives
  if (obj instanceof Set) return new Set(obj); // See note about this!
  if (obj instanceof Map) return new Map(obj);
  if (hash.has(obj)) return hash.get(obj); // cyclic reference
  const result = obj instanceof Date ? new Date(obj)
               : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
               : obj.constructor ? new obj.constructor() 
               : Object.create(null);
  hash.set(obj, result);
  if (obj instanceof Map)
      Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)) );
  return Object.assign(result, ...Object.keys(obj).map (
      key => ({ [key]: deepClone(obj[key], hash) }) ));
}

// start, begin, main

var graph = new Graph();
var dm = new DynamicMatching(graph, 1);
var tgraph = new TemporalGraph(graph, new Range(0, 0));
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

console.log(print_all(tgraph));

console.dir(tgraph.V);
console.log('done');