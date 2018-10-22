var future = []; 

future.redo = function(graph){
  var event = this.shift();
  if(event){
    graph[event.command](event.info);
  }
};

module.exporta = future;