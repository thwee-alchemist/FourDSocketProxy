class Range {
  constructor(start, end){
    this.start = start;
    this.end = end;
    Range.all.add(this);
  
    return this;
  }
  
  copy(){
    return new Range(this.start, this.end);
  }
  
  release(){
    Range.all.delete(this);
  }
  
  begins_before(other){
    return this.start < other.end;
  }
  
  ends_after(other){
    return this.end > other.end;
  }
  
  begins_after(other){
    return this.start > other.start;
  }
  
  ends_before(other){
    return this.end < other.end;
  }
  
  avg(){
    return (this.start + this.end) / 2.0;
  }
  
  contains(other){
    if(other instanceof Number){
      return (this.start <= other) && (this.end >= other);
    }
    if(other instanceof Range){
      return (this.start <= other.start) && (this.end >= other.end);
    }
  }
}
Range.all = new Set();

module.exports = Range;