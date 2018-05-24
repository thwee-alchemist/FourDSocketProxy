# FourDSocketProxy

[Joshua Marshall Moore](mailto:moore.joshua@pm.me)

May 24th, 2018

## Installation

    git clone https://github.com/thwee-alchemist/FourDSocketProxy
    npm install
    cd FourDSocketProxy
    node test.js

## Usage

FourDSocketProxy comprises two systems, the browser frontend, and the socket server. 

To run fourd, import the init function, and wait for the promise to resolve, like so:

```
var SIZE = 5;
require('./FourDSocketProxyServer.js')().then(fourd =>{
    fourd.clear();
    var options = {cube: {size: 10, color: 0x0000ff}};

    var depths = [];
    for(var k=0; k<SIZE; k++){
        var rows = [];
        for(var i=0; i<SIZE; i++){
            var column = [];
            for(var j=0; j<SIZE; j++){
                column.push(fourd.add_vertex(options));
                if(j>0){
                    fourd.add_edge(column[j], column[j-1]);
                }
                if(i>0){
                    fourd.add_edge(column[j], rows[i-1][j]);
                }
                if(k>0){
                    fourd.add_edge(column[j], depths[k-1][i][j]);
                }
            }
            rows.push(column);
        }
        depths.push(rows);
    }
});
```

## Specifications
Runs about 250 vertices before slowing down significantly, just design around it. 

## Acknowledgements

FourDSocketProxy uses 

* [three.js](https://threejs.org/), currently release 90, and
* [jquery](https://jquery.org/).

On the server, we have 

* [express](expressjs.com), and
* [socket.io](socket.io).
