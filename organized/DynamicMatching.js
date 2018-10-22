var PriorityQueue = require('./PriorityQueue.js');
var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');
var DMVertex = require('./DMVertex.js');
var DMEdge = require('./DMEdge.js');
var Graph = require('./Graph.js');
var _ = require('lodash');

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
    this.V = new Map(); // holds the vertices of this dynamic matching
    this.E = new Set(); // holds the edges of this dynamic matching
    this.pq = new PriorityQueue(); // ge
    
    this.m = new Map();
    
    if(n > 0){
      this.coarser = new DynamicMatching(this, --n);
    }
    
    if(finer){
      finer.coarser = this; // a doubly linked list

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

module.exports = DynamicMatching;
