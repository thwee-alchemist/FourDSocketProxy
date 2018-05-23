var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var open = require('open');
var get_port = require('get-port');

var port = get_port(160100);
server.listen(port);
console.log('listening on port ' + port);
open('http://localhost:' + port);

app.use(express.static('lib'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

console.log('Please open a page at http://localhost');
var create_fourd = async function(){
  var promise = new Promise((resolve_fourd) => {
  
    io.on('connection', function(socket){
      console.log('Page connected...');
      
      var FourDMirror = function(){
        this.vertex_id = 0;
        this.edge_id = 0;
        this.vertices = new Set();
        this.edges = new Set();
      };
      
      FourDMirror.prototype.add_vertex = function(){
        var id = this.vertex_id++;
        this.vertices.add(id);
        return id;
      };
      
      FourDMirror.prototype.remove_vertex = function(id){
        this.vertices.delete(id);
      }
  
      
      FourDMirror.prototype.add_edge = function(){
        var id = this.edge_id++;
        this.edges.add(id);
        return id; 
      };
      
      FourDMirror.prototype.remove_edge = function(id){
        this.edges.delete(id);
      };
      
      FourDMirror.prototype.clear = function(){
        this.vertex_id = 0;
        this.edge_id = 0;
        
        this.vertices.clear();
        this.edges.clear();
      };
      
      var mirror = new FourDMirror();
      
      fourd = {
        add_vertex: function(options){
          socket.emit('add vertex', options);
          return mirror.add_vertex();
        },

        add_edge: function(a, b){
          socket.emit('add edge', {source: a, target: b});
          return mirror.add_edge();
        },

        remove_vertex: function(id){
          socket.emit('remove vertex', id);
          mirror.remove_vertex(id);
        },

        remove_edge: function(id){
          socket.emit('remove edge', id);
          mirror.remove_edge(id);
        },

        clear: function(){
          socket.emit('clear');
          mirror.clear();
        },
        
        vertices: mirror.vertices,
        edges: mirror.edges
      };
      
      resolve_fourd(fourd);
    });
  });
  
  fourd = await promise;
  return fourd;
};

module.exports.fourd = create_fourd();