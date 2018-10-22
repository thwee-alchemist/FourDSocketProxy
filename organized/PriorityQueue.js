// to store element and its priority
class QElement {
  constructor(element, priority)
  {
    this.element = element;
    this.priority = priority;
  }
}
 
// PriorityQueue class
class PriorityQueue {
 
  // An array is used to implement priority
  constructor(){
    this.items = [];
  }
  
  next(element){
    return this.items[this.items.indexOf(this.items.find(qe => qe.element == element)) + 1];
  }
  
  previous(element){
    return this.items[this.items.indexOf(this.items.find(qe => qe.element == element)) - 1];
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

module.exports = PriorityQueue;
