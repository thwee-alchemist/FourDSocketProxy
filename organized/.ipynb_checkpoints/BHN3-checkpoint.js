var THREE = require('three');
var Graph = require('./Graph.js')

var BHN3 = function(){
  this.inners = [];
  this.outers = {};
  this.center_sum = new THREE.Vector3(0, 0, 0);
  this.center_count = 0;
};

var CONSTANTS = {
  width: 1000,
  attraction: 0.05,
  far: 1000,
  optimal_distance: 10.0,
  minimum_velocity: 0.001,
  friction: 0.60,
  zoom: -25,
  gravity: 10, 
  BHN3: {
    inner_distance: 0.36,
    repulsion: 25.0,
    epsilon: 0.1
  }
};

BHN3.prototype.constants = CONSTANTS.BHN3;

BHN3.prototype.center = function(){
  return this.center_sum.clone().divideScalar(this.center_count);
};

BHN3.prototype.place_inner = function(vertex){
  this.inners.push(vertex);
  this.center_sum.add(vertex.object.position);
  this.center_count += 1;
};



BHN3.prototype.get_octant = function(position){
  var center = this.center();
  var x = center.x < position.x ? 'l' : 'r';
  var y = center.y < position.y ? 'u' : 'd';
  var z = center.z < position.z ? 'i' : 'o';
  return x + y + z;
};

BHN3.prototype.place_outer = function(vertex){
  var octant = this.get_octant(vertex.object.position);
  this.outers[octant] = this.outers[octant] || new BHN3();
  this.outers[octant].insert(vertex);
};

BHN3.prototype.insert = function(vertex){
  if(this.inners.length === 0){
    this.place_inner(vertex);
  }else{
    if(this.center().distanceTo(vertex.object.position) <= this.constants.inner_distance){
      this.place_inner(vertex);
    }else{
      this.place_outer(vertex);
    }
  }
};

BHN3.prototype.estimate = function(vertex, force, force_fn){
  if(this.inners.indexOf(vertex) > -1){
    for(var i=0; i<this.inners.length; i++){
      if(vertex !== this.inners[i]){
        var individual_force = force_fn(
          vertex.object.position.clone(),
          this.inners[i].object.position.clone()
        );

        force.add(individual_force);
      }
    }
  }else{
    var sumstimate = force_fn(vertex.object.position, this.center());
    sumstimate.multiplyScalar(this.center_count);
    force.add(sumstimate);
  }

  for(var octant in this.outers){
    this.outers[octant].estimate(vertex, force, force_fn);
  }
};

BHN3.prototype.pairwise_repulsion = function( x1, x2 ){

  var enumerator1, denominator1, 
    enumerator2, denominator2, 
    repulsion_constant, 
    difference, absolute_difference, 
    epsilon, product, 
    term1, term2,
    square, sum, result; 

  // first term
  enumerator1 = repulsion_constant = CONSTANTS.BHN3.repulsion;

  difference = x1.clone().sub(x2.clone());
  absolute_difference = difference.length();

  epsilon = CONSTANTS.BHN3.epsilon;
  sum = epsilon + absolute_difference;
  denominator1 = square = sum*sum;

  term1 = enumerator1 / denominator1;

  // second term
  enumerator2 = difference;
  denominator2 = absolute_difference;

  term2 = enumerator2.divideScalar(denominator2);

  // result
  result = term2.multiplyScalar(term1);  

  return result;
};

module.exports = BHN3;