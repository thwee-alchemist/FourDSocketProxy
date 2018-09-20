
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
    this.data = data;
    this.id = ++Edge.id;
    
    this.source.edges.add(this);
    this.target.edges.add(this);
    
    this.count = 0;
    this.order = Math.random();
    
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
 * class DynamicMatching
 * 
 * responsible for maintaining coarser and coarser versions of an
 * initially attached graph. 
 */
class DynamicMatching {
  constructor(finer, n){
    console.log(`constructing Dynamic Matching ${n}...`)
    this.V = new Map(); // a map from finer to coarsar vertex. 
    this.E = new Set();
    this.S = new Set();
    this.M = new Map();
    this.pq = new PriorityQueue();
    this.match_equation_results = new Map();
    this.n = n;

    this.coarser = --n ? new DynamicMatching(this, n) : null;
    
    // poetry, right here
    var finer_add = finer.add;
    finer.add = (v_or_e_prime) => {
      finer_add.apply(finer, v_or_e_prime);
      this.add(v_or_e_prime);
    }

    var finer_delete = finer.delete;
    finer.delete = (v_or_e) => {
      this.delete(v_or_e);
      finer_delete.apply(finer, v_or_e);
    }
    
    return this;
  }
  
  change_propagation(){
    while(!this.pq.empty()){
      var e = this.pq.dequeue();
      var m = this.match_equation(e);
      if(m != this.match_equation_results.get(e)){
        this.match_equation_results.set(e, m);
        if(m){
          this.match(e);
        }else{
          this.unmatch(e);
        }
      }
    }
    
    if(this.coarser){
      this.coarser.change_propagation();
    }
  }
  
  match_equation(e){
    if(this.E.size == 0){
      return true;
    }
    
    var m = true;
    for(var edge in this.E){
      m = m && !this.depends(edge, e);
    }
    
    return m;
  }
  
  match(e){
    console.log(`match(${e})`);
    // "For each edge e' where e -> e' ..."
    [...this.E]
      .filter(e_prime => this.depends(e, e_prime))
      .map(e_prime => {
        // "... if e' is matched, ..."
        if(this.M.has(e_prime)){
          // "... then unmatch(e')."
          this.unmatch(e_prime);
        }
        // "Delete vertices v1_prime and v2_prime from the 
        // coarser graph."
        var v1_prime = this.M.get(e.source);
        this.V.delete(v1_prime);
        this.M.delete(v1_prime);

        var v2_prime = this.M.get(e.target);
        this.V.delete(v2_prime);
        this.M.delete(v2_prime);

        // Create a new vertex v1 U v2 in G'.
        var v1_u_v2 = new Vertex(new Set([edge.source, edge.target]));
        this.add(v1_u_v2);
        
        // "For all edges e = (v, v') in G incident on v1 or v2 
        // (but not both), add a corresponding edge to or from 
        // v1 ∪ v2 in G'."
        
        var add_e_prime_to_G_prime = (cv, edge) => {
          // cv: corresponding vertex
          var edge = new Edge(v1_u_v2, cv); 
          this.add(edge);
        };
        
        [...edge.source.edges]
        .filter(pie => pie != edge)// v1.edges that are not this edge
        // now we have incident edges
        .filter(pie => !pie.data.has(edge.source))
        // potentially incident edge
        .map(ie => {
          if((edge.source == ie.source) || (edge.target == ie.source)){
            var edge = new Edge(this.V.get(ie.source), v1_u_v2);
            this.add(edge);
          }
          if((edge.source == ie.target) || (edge.target == ie.target)){
            var edge = new Edge(this.V.get(ie.target), v1_u_v2);
            this.add(edge);
          }
        });

        [...edge.target.edges]
        .filter(pie => pie != edge)
        .filter(pie => !pie.data.has(edge.target))
        .map(ie => {
          if((edge.target == ie.target || edge.source == ie.target)){
            var edge = new Edge(this.V.get(ie.target), v1_u_v2);
            this.add(edge);
          }
          if((edge.target == ie.source) || (edge.target == ie.source)){
            var edge = new Edge(this.coarser.V.get(ie.source), v1_u_v2);
            this.add(edge);
          }
        })
          
          // might need a third check to see if its not this edge.   
      });
        
      var v_prime = new Vertex(new Set([e.source, e.target]));
      this.E.add(v_prime);
        // 
    
    // "Both match(e) and unmatch(e) add the dependent edges of e to the queue..."
    this.pq.enqueue(e, e.order);
  }

  unmatch(e){
    console.log(`unmatch(${e})`);
    if(this.coarser){
      // ".delete any edges in G' incident on v1 ∪ v2.
      [...this.coarser.E]
        .filter(edge => edge.source == e.source
                || edge.source == e.target
                || edge.target == e.source
                || edge.target == e.target)
        .map(edge => { 
          this.delete(this.V.get(edge.source));
          this.delete(this.V.get(edge.target));
        });
      
      // ". Delete the vertex v1 ∪ v2 from G'." 
      this.delete(this.V.get(e.source));
      this.delete(this.V.get(e.target)); // not sure this is necessary
      
      // "For each edge incident on v1 or v2 in G, add a 
      // corresponding edge to G'."
      [...v1.edges, ...v2.edges].map(incident_edge => {
        this.add(new Edge(
          this.V.get(incident_edge.source), 
          this.V.get(incident_edge.target)
        ));
      });
      
      // "For each e' such that e → e', add e' to the queue."
      for(var edge in this.E){
        if(this.depends(e, edge)){
          this.pq.enqueue(edge, edge.order);
        }
      }
    }
  }
  
  add(v_or_e){
    if(v_or_e === undefined){
      throw Error("nothing to add!")
    }
    console.log(`Dynamic Matching ${this.n}: adding ${v_or_e}`);

    if(v_or_e instanceof Vertex){
      var vertex = v_or_e;
      
      var v_prime = new Vertex(vertex);
      this.V.set(vertex, v_prime);
    }
    
    if(v_or_e instanceof Edge){
      var edge = v_or_e;
      
      if(this.match_equation(edge)){
        this.match(edge);
      }

      // "Increase the count of (v1', v2') in E' (possibly adding edge if not 
      // already present.
      if([...this.V]
        .filter(v => v.data == edge)
        .map(v => {
          v.data.count++;
        })
        .length == 0)
      {
        var e_prime = new Edge(
          this.V.get(edge.source),
          this.V.get(edge.target)
        )
        this.add(e_prime);
      }else{
        [...this.E]
        .find(e => e.data.has(edge))
        .count++;
      }
      
      this.pq.enqueue(edge, edge.order);
    }
    this.change_propagation();
  }
  
  priority(e1, e2){
    return this.orders.get(e1) < this.orders.get(e2);
  }
  
  delete(v_or_e){
    console.log(`deleting ${v_or_e}`);
    if(v_or_e instanceof Vertex){
      var vertex = v_or_e;
      for(var edge in vertex.edges){
        edge.count--;
        if(edge.count == 0){
          this.delete(edge);
        }
      }
    }
    
    if(v_or_e instanceof Edge){
      var edge = v_or_e;
      if(this.matching.has(edge)){
        // "If e is in the matching then unmatch(e)."
        this.unmatch(edge);
        
        // 
        if(this.coarser){
          var vertex = [...this.coarser.E].find(v => v.data == edge);
          if(!(--vertex.data.count)){
            this.coarser.delete(vertex);
          }
        }
        
        this.V.delete(edge)
      }
    }
    
    this.change_propagation();
  }
  
  depends(e1, e2){
    return (e1.order < e2.order) && e1.shares_vertex(e2);
  }
}

var graph = new Graph();
var dm = new DynamicMatching(graph, 1);

var v1 = new Vertex(1);
var v2 = new Vertex(2);
var v3 = new Vertex(3);
var v4 = new Vertex(4);
var v5 = new Vertex(5);
var v6 = new Vertex(6);

 console.log(v1);

graph.add(v1);
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

console.dir(graph);
console.dir(dm);