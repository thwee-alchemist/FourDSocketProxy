/*
  FourDProxyClient.js
  Joshua Marshall Moore
  moore.joshua@pm.me
  
  Seattle, May 18th, 2018
*/

$('#display').fourd({
  width: document.width, 
  height: document.height,
  background: 0xffffff
});
var fourd = $('#display').fourd('underlying_object');
var socket = io();

var vertices = new Map();
var edges = new Map();

$('#display').on('mousedown', event => {
  var vertex = fourd.resolve_click(event);
  if(vertex){
    socket.emit('mouse click', {
      button_id: event.which, 
      vertex_id: vertex.id
    });
  }
});

socket.on('connect', function(){
  console.log('connected');
  fourd.clear();
  fourd._internals.camera.position = new THREE.Vector3(0, 0, -25);
  fourd._internals.camera.lookAt(new THREE.Vector3());
  
  // fourd.graph.add_vertex({cube: {color: 0x000000, size: 10}});
  // setTimeout(fourd.clear, 1000);
});

socket.on('add vertex', function(options){
  var vertex = fourd.graph.add_vertex(options);
  vertices.set(vertex.id, vertex);
});

socket.on('add edge', function(options){
  var source = vertices.get(options.source);
  var target = vertices.get(options.target);
  var edge = fourd.graph.add_edge(source, target);
  edges.set(edge.id, edge);
});

socket.on('remove vertex', function(vertex_id){
  fourd.graph.remove_vertex(vertices.get(vertex_id));
});

socket.on('remove edge', function(edge_id){
  fourd.graph.remove_edge(edges.get(edge_id));
});

socket.on('clear', function(){
  $('#display').fourd('clear');
});
