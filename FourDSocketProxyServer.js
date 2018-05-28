'use strict';

/*
  FourDSocketProxyServer
  
  Joshua Marshall Moore
  moore.joshua@pm.me
  
  May 23rd, 2018
*/

module.exports = async function(options){
  var express = require('express');
  var app = express();
  var path = require('path');
  
  app.use(express.static(path.join(__dirname, 'lib')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  var server = require('http').Server(app);
  var FourDMirror = require('./FourDMirror.js');
  var get_port = require('get-port');
  var opn = require('opn');

  var options;
  if(!options){
    options = {
      port: 16100
    }
  }
  
  return get_port({port: options.port}).then(port => {
    server.listen(port);
    var address = `http://localhost:${port}`;
    console.log('server listening at ' + address);
    opn(address);
    
    var io_promise = new Promise(resolve_io => {
      var io = require('socket.io')(server);
      resolve_io(io);
    });

    return io_promise;
  }).then(function(io){
    class FourD{
      constructor(io, mirror){
        this.io = io;
        this.mirror = mirror;
        this.vertices = mirror.vertices;
        this.edges = mirror.edges;
        return this;
      }

      add_vertex(options){
        this.io.emit('add vertex', options);
        return this.mirror.add_vertex();
      }

      add_edge(a, b){
        this.io.emit('add edge', {source: a, target: b});
        return this.mirror.add_edge();
      }

      remove_vertex(id){
        this.io.emit('remove vertex', id);
        this.mirror.remove_vertex(id);
      }

      remove_edge(id){
        this.io.emit('remove edge', id);
        this.mirror.remove_edge(id);
      }

      clear(){
        this.io.emit('clear');
        this.mirror.clear();
      }
    }

    var fourd_promise = new Promise(resolve_fourd => {
      io.on('connection', (socket) => {
        var fourd = new FourD(io, new FourDMirror()); 
        resolve_fourd(fourd);
      });
    });

    return fourd_promise;
  });
};
