# FourDSocketProxy

[Joshua Marshall Moore](mailto:moore.joshua@pm.me)

May 19th, 2018

## Installation

`npm install fourdsocketproxy`

## Usage

FourDSocketProxy comprises two systems, the browser frontend, and the socket server. 

To run fourd, 

`var fourd = require('fourdsocketproxy').fourd;`

Then you'll have the following commands available to you: 

```
fourd.clear();
var a = fourd.add_vertex({cube: {size: 10, color: 0x000000}});
var b = fourd.add_vertex({cube: {size: 10, color: 0x000000}});

var e = fourd.add_edge(a, b);

fourd.remove_edge(e);
fourd.remove_vertex(a);
fourd.remove_vertex(b);
```
