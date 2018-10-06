/*
  Joshua Marshall Moore
  2018-09-19
*/


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
    this.data = data;
    this.id = ++Vertex.id;
    
    this.edges = new Set();
    return this;
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
    return `Vertex ${this.id}`;
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
    console.log(`new Edge(${source}, ${target})`);

    this.source = source;
    this.target = target;
    this.id = ++Edge.id;
    
    this.source.edges.add(this);
    this.target.edges.add(this);
    
    this.count = 0;
    this.order = Math.random();
    
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
    return `Edge ${this.id}`;
  }
}
Edge.id = 0;

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
  constructor(){
    this.V = new Set();
    this.E = new Set();
    this.id = ++Graph.id;
    
    return this;
  }
  
  /*
    add(vertex|edge)
    
    Adds to the graph a vertex or edge passed into this function. 
  */
  add(vertex_or_edge){
    console.log(`Graph ${this.id} adding ${vertex_or_edge}`);
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
    
    return this; // for chaining
  }
  
  
  /*
    delete(vertex|edge)
    
    Removes from the graph a vertex or edge passed into this function. 
    
    When a vertex is removed, its incident edges are removed, as well. 
    When an edge is removed, its references in its incident vertices are removed, 
    as well. 
  */
  delete(vertex_or_edge){
    console.log(`Graph ${this.id}: deleting ${vertex_or_edge}`);
    
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
    
    return this;
  }
}
Graph.id = 0;

// to store element and its priority
class QElement {
  constructor(element, priority)
  {
    this.element = element;
    this.priority = priority;
  }
}
 
// PriorityQueue class
// fresh plucked from the internet...
class PriorityQueue {
 
  // An array is used to implement priority
  constructor(){
    this.items = [];
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

/**
 * class DMVertex
 * 
 * Encapsulates a vertex with a set union operation
 */
class DMVertex extends Vertex {
  constructor(data){
    super(data);
    this.data = new Set(arguments);
  }

  union(dmvertex){
    return new DMVertex(this, dmvertex);
  }

  has(vertex){
    return this.data.has(vertex) 
      || [...this.data].some(
        v => v instanceof DMVertex && v.data.has(vertex)
      );
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
  constructor(source, target, data){
    super(source, target, data);
    this.count = 0;
  }
}

/**
 * class DynamicMatching
 * 
 * responsible for maintaining coarser and coarser versions of an
 * initially attached graph. 
 */
class DynamicMatching {
  constructor(finer, n){
    this.id = ++DynamicMatching.id;

    if(finer instanceof Graph){
      [...finer.E].map()
    }

    var finer_add = finer.add.bind(finer);
    var finer_delete = finer.delete.bind(finer);

    var that = this;
    finer.add = (entity) => {
      finer_add(entity);
      that.add(entity);
      that.process_queue();
    }

    finer.delete = (entity) => {
      that.delete(entity);
      finer_delete(entity);
      that.process_queue();
    }

    this.finer = finer;
    this.finer.coarser = this;
    this.V = new Map();
    this.E = new Set();
    this.pq = new PriorityQueue();
    this.coarser = n > 0 ? new DynamicMatching(this, n-1) : null;
    this.m = new Map();
  }

  add(v_or_e){
    console.log(`Dynamic Matching ${this.id} adding ${v_or_e}`);

    if(v_or_e instanceof Vertex){
      this.add_vertex(v_or_e);
    }
    if(v_or_e instanceof Edge){
      this.add_edge(v_or_e);
    }
  }

  add_vertex(v){
    this.V.set(v, new DMVertex(v));
  }

  get_corresponding(v_or_e){
    if(v_or_e instanceof Vertex){
      var v = v_or_e;
      return this.V.get(v);
    }
    if(v_or_e instanceof Edge){
      var e = v_or_e;
      return [...this.E].find(e_prime => e_prime.source.has(e.source) && e_prime.target.has(e.target));
    }
  }

  add_edge(e){
    var v1_prime = this.get_corresponding(e.source);
    var v2_prime = this.get_corresponding(e.target);
    var e_prime = this.get_corresponding(e);
    if(!e_prime){
      e_prime = new DMEdge(v1_prime, v2_prime);
    }
    this.pq.enqueue(e_prime, e_prime.order);
  }

  delete(v_or_e){
    console.log(`Dynamic Matching ${this.id} deleting ${v_or_e}`);

    if(v_or_e instanceof Vertex){
      return this.delete_vertex(v_or_e);
    }

    if(v_or_e instanceof Edge){
      return this.delete_edge(v_or_e);
    }
  }

  delete_vertex(v){
    [...v.edges].map(e => this.delete_edge(e));
    if(this.coarser){
      this.coarser.delete(this.V.get(v));
    }
    this.V.delete(v);
  }

  delete_edge(e){
    if(this.E.has(e)){
      this.unmatch(e);
    }

    if(this.coarser){
      var e_prime = [...this.coarser.E].find(e_prime => {
        var v1_prime = e_prime.source;
        var v2_prime = e_prime.target;
        return v1_prime.has(e.source) 
          && v2_prime.has(e.target);
      });

      e_prime.count--;
      if(e_prime.count == 0){
        this.coarser.delete(e_prime);
      }

      if(e.source.edges.size == 0){
        this.coarser.delete(this.get_corresponding(e.source));
      }
      if(e.target.edges.size == 0){
        this.coarser.delete(this.get_corresponding(e.target));
      }
    }

    [...this.E]
    .filter(edge => this.depends(e, edge))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  depends(e1, e2){
    var priority = e1.order < e2.order;
    var share_vertex = e1.shares_vertex(e2);
    return priortiy && share_vertex;
  }

  match(e){
    console.log(`Dynamic Matching ${this.id} matching ${e}`);

    // For each edge e' where e -> e', if e' is matched then
    // unmatch(e').
    [...this.E]
    .filter(e2 => this.depends(e, e2) && this.m.get(e2))
    .map(e2 => this.unmatch(e2));
    
    // Delete vertices v1_coarse and v2_coarse from the coarser graph.
    if(this.coarser){
      var v1_prime = this.get_corresponding(e.source);
      var v2_prime = this.get_corresponding(e.target);
      this.coarser.delete(v1_prime);
      this.coarser.delete(v2_prime);
      
      // Create a new vertex v1 U v2 in G'. 
      var v1_u_v2 = new DMVertex(e.source, e.target);
      this.coarser.add(v1_u_v2);

      // For all edges e = (v, v') in G incident on v1 or v2
      // (but not both), add a corresponding edge to or from v1 U v2
      // in G'.
      [...e.source.edges]
      .filter(edge => edge != e)
      .map(edge => {
        var other_vertex = new DMVertex(edge.source);
        var corresponding_edge = new DMEdge(other_vertex, v1_u_v2);
        this.coarser.add(other_vertex);
        this.coarser.add(corresponding_edge);
      });
      [...e.target.edges]
      .filter(edge => edge != e)
      .map(edge => {
        var other_vertex = new DMVertex(edge.target);
        var corresponding_edge = new DMEdge(v1_u_v2, other_vertex);
        this.coarser.add(other_vertex);
        this.coarser.add(corresponding_edge);
      });
    }

    [...this.E]
    .filter(edge => this.depends(e, edge))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  unmatch(e){
    console.log(`Dynamic Matching ${this.id} unmatching ${e}`);

    if(this.coarser){
      var v1_u_v2 = this.coarser.V.find(
        v => v.has(e.source) && v.has(e.target)
      );

      [...v1_u_v2.edges]
      .map(incident_edge => this.coarser.delete(incident_edge));

      this.coarser.delete(v1_or_v2);

      this.coarser.V.set(e.source, new DMVertex(e.source));
      this.coarser.V.set(e.target, new DMVertex(e.target));

      [...e.source.edges]
      .map(edge => this.coarser.add(new DMEdge(
        this.coarser.V.get(e.source),
        this.coarser.V.get(edge.source == e.source ? edge.target : edge.target)
      )));
      [...e.target.edges]
      .map(edge => this.coarser.add(new DMEdge(
        this.coarser.V.get(e.target),
        this.coarser.V.get(edge.target == e.target ? edge.source : edge.target)
      )));
    }

    [...this.E]
    .filter(edge => this.depends(e, edge))
    .map(edge => this.pq.enqueue(edge, edge.order));
  }

  match_equation(e){
    if(this.E.size == 0){
      return true;
    }

    var m = [...this.E]
    .filter(edge => this.depends(edge, e))
    .every(edge => !this.match_equation(edge));
    this.m.set(e, m);
    return m;
  }

  process_queue(){
    while(!this.pq.empty()){
      var e = this.pq.dequeue();
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
    return `Dynamic Matching ${this.id}`;
  }
}
DynamicMatching.id = 0;

var graph = new Graph();

var dm = new DynamicMatching(graph, 2);

var v1 = new Vertex();
var v2 = new Vertex();
var v3 = new Vertex();
var v4 = new Vertex();
var v5 = new Vertex();
var v6 = new Vertex();
console.log(v1);

graph.add(v1);
console.log('added', v1, 'to', graph);


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

graph.add(e1);
graph.add(e2);
graph.add(e3);
graph.add(e4);
graph.add(e5);
graph.add(e6);
graph.add(e7);

console.log(graph);
console.log(graph.coarser);
console.log(graph.coarser.coarser);
console.log(graph.coarser.coarser.coarser);