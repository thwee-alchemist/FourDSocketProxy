# FourDSocketProxy

[Joshua Marshall Moore](mailto:moore.joshua@pm.me)

May 24th, 2018

## Installation

    npm install fourdsocketproxy

## Usage

FourDSocketProxy comprises two systems, the browser frontend, and the socket server. 

To run fourd, import the init function, and wait for the promise to resolve, like so:

```js
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

## API
Calling `require('fourdsocketproxy')` doesn't do much, but returns a function; Call it, and you get a promise for a `fourd` object. The `fourd` object defines the following functions:

```js
var a = fourd.add_vertex(vertex_options);
var b = fourd.add_vertex(vertex_options);

var e = fourd.add_edge(a, b);

fourd.remove_edge(e);
fourd.remove_vertex(a);
fourd.clear();
```


## Options
The add_vertex function takes a small number of options:

```js
var options = {cube: {size: 10, color: 0x000000}};
// or
var options = {cube: {size: 10, texture: 'path/to/img.jpg'}}
```

## Callbacks
The fourd object is an EventEmitter, you can react to clicks on an individual vertex like so: 

```js
// initialization, as above ...
fourd.on('click', event => {
    console.log(`mouse click! button: ${event.button_id}, vertex_id: ${event.vertex_id}.`);
});
```

## Etc.
The FourD frontend runs about 250 vertices. More are possible, but you might want to design around this limitation. 

## Acknowledgements

FourDSocketProxy uses 

* [three.js](https://threejs.org/), currently release 90, and
* [jquery](https://jquery.org/).

On the server, we have 

* [express](expressjs.com), and
* [socket.io](socket.io).
