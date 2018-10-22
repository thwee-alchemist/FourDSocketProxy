var Vertex = require('./Vertex.js');
var Edge = require('./Edge.js');
var TemporalGraph = require('./TemporalGraph.js');

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

module.exports = {
  coarser: coarser,
  print_all: print_all,
  choice: choice,
  randomize_graph: randomize_graph,
  collect_all: collect_all,
  also: also,
  LEVELS: LEVELS,
  union: union,
  intersection: intersection,
  difference: difference,
  subtract: subtract, 
  deep_assign: deep_assign,
  deepClone: deepClone
}
