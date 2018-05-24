var FourD = require('./FourDSocketProxyServer.js');
var fourd;
FourD({port: 16100}).then(_fourd => {
    fourd = _fourd;
    console.log(fourd);
    fourd.clear();

    var options = {cube: {size: 10, color: 0x000000}};

    var rows = [];
    for(var i=0; i<10; i++){
        var column = [];
        for(var j=0; j<10; j++){
            column.push(fourd.add_vertex(options));
            if(j>0){
                fourd.add_edge(column[j], column[j-1]);
            }
            if(i>0){
                fourd.add_edge(column[j], rows[i-1][j]);
            }
        }
        rows.push(column);
    }
});