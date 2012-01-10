// differential inheritance
// yay
//
var node = {
 name : 'default',
 toString : function(){
     return 'node '+this.name;
 }
};

var node_collection = {
    name : 'map name',
    nodes : [],
    add_new_node : function(name){
        var new_node = Object.create(node);
        new_node.name = name;
        this.nodes.push(new_node);
        return new_node;
    },
    toString : function(){
        var s = this.name;
        s = s + '\n nodes:';
        for (i in this.nodes){
            s = s + '\n  ' + this.nodes[i].toString();
        };
        return s;
    }
};

document.writeln();

var north_america = Object.create(node_collection);
north_america.name = 'North America';

document.writeln('adding '+north_america.add_new_node('canada'));
document.writeln('adding '+north_america.add_new_node('usa'));
document.writeln('adding '+north_america.add_new_node('mexico'));

document.writeln(north_america);

document.writeln('finished');
