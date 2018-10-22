var history = []; 

// cartaker
history.undo = function(subject){
  var event = this.pop();

  var undos = {
    'add': 'delete'
  };

  if(event){
    subject[undos[event.command]](event.info);
    future.unshift(event.command, event.info);
  }else{
    console.log('history empty.');
  }
};

module.exports = history;
