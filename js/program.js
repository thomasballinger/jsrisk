// differential inheritance
// yay
//
var country = {
 'name' : 'default',
 'player' : undefined,
 'num_troops' : undefined,
 'connected_to' : [],
 'get_troops' : function(){
    return this.num_troops;
 },
 'init' : function(name, connected_to_array){
    this.name = name;
    this.connected_to = connected_to_array;
 },
 'set_state' : function(player, num_troops){
     this.player = player;
     this.num_troops = num_troops;
 },
 'toString' : function(){
    return this.name + ' owned by ' + this.player + ' with '+ this.num_troops +
        '\n    connected to ' + this.connected_to;
 },
};



var map = {
    name : 'map name',
    countries : [],
    add_country : function(country){
        this.countries.push(country);
    },
    add_new_country : function(name, connected_to_array){
        var new_country = Object.create(country);
        country.name = name;
        country.connected_to = connected_to_array;
        country.num_troops = 0;
        this.countries.push(country);
        return country;
    },
    toString : function(){
        return this.name;
    },
    set_name : function(name){
        this.name = name;
    },
    get_ascii : function(){
        var s = this.name;
        s = s + '\n countries:';
        for (i in this.countries){
            s = s + '\n  ' + this.countries[i].toString();
        }
        return s;
    }
};

var north_america = Object.create(map);
north_america.set_name('North America');
north_america.add_new_country('canada', ['usa']);
north_america.add_new_country('usa', ['canada', 'mexico']);
north_america.add_new_country('mexico', ['usa']);

document.writeln();
document.writeln(north_america);
document.writeln('this should be pretty:')
document.writeln(north_america.get_ascii());
document.writeln('country: ')
document.writeln(country);


document.writeln('finished');
