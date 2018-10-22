var Graph = require('./Graph.js');

class DifferenceGraph extends Graph{
  constructor(a, b){
    super();
    if(a.V.size > b.V.size){
      this.V = new Set([...a.V].filter(v => !b.V.has(v)));
    }
    this.V = new Set([...a.V].filter(v => !b.V.has(v)));
    this.E = new Set([...a.E].filter(e => !b.E.has(e)));
    
    return this;
  }
}

module.exports = DifferenceGraph;