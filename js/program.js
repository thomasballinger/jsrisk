// Risk in javascript
// First project in javascript
// planning for a client/server architecture
//


// This shouldn't actually be private! The closure is costing
// us tons of memory I imagine? Country is really just a
// convenience object for storing data, shouldn't every be used
// by anything other than map
var country = function(in_name, connected_to_array){
    // These are private variables
    name = in_name;
    player = undefined;
    num_troops = undefined;
    connected_to = connected_to_array;

    // These are public methods
    return {
        'get_troops' : function(){return num_troops;},
        'get_owner' : function(){return player;},
        'get_touching' : function(){return connected_to},
        'is_owned_by' : function(in_player){return in_player == player},
        'is_touching' : function(from, to){
            for (var i = 0; i < connected_to.length)

        'set_state' : function(in_player, num_troops){
            player = player;
            num_troops = num_troops;
        },
        'toString' : function(){
           return name + ' owned by ' + player + ' with '+ num_troops +
               '\n    connected to ' + connected_to;
        },
        'jsonify' : function(){
            var j = {
                'name' : name,
                'player' : player,
                'num_troops' : num_troops,
                'connected_to' : connected_to
            }
            return j;
        }
    };
};

var map = function(name){
    // private variables
    countries = [];
    players = ['tom', 'ryan'];
    actions = {
        'move' : {
            // soft stuff - what to suggest, info
            description : 'Move troops from one owned country to an adj. one',
            args : ['player', 'from', 'to', 'how_many'],
            should_be_suggested : function(){return true;},
            arg_suggest_functions : [
                function(){return players;},
                function(player){
                    var owned = get_countries_owned(player);
                    var to_suggest = [];
                    for (var i = 0; i < owned.length; i++){
                        if (owned[i].get_troops()) > 1){
                            if (get_countries_owned_by_and_touching(player, owned[i]).length > 0){
                                to_suggest.push(owned[i]);
                            }
                        }
                    }
                    return to_suggest;
                },
                function(player, from){
                    return get_countries_owned_by_and_touching(player, from);
                },
                function(player, from, to){
                    var troops = from.get_troops();
                    results = [];
                    for (var i = 1; i < troops; i++){
                        results.push(i);
                    }
                    return results;
                },
            ],

            // hard stuff - implementation of the action
            // actions return true or false depending on if they succeed
            action : function(player, from, to, how_many){
                if (!(from.is_owned_by(player) && to.is_owned_by(player))){return false;}
                if (how_many > how_many - 1){return false;}
                // todo: add if the move is allowed at this turn stage etc.
                if (!(from.

    var get_countries_owned = function(player){
        var countries_owned = [];
        for (var i = 0; i < countries.length; i++){
            if (countries[i].is_owned_by(player)){
                countries_owned.push(countries[i]);
            }
        }
        return countries_owned;
    };
    var get_countries_owned_by_and_touching = function(player, country){
        var results = [];
        var touching = from.get_touching(country);
        for (var i = 0; i < touching.length; i++){
            if (touching[i].is_owned_by(player)){
                results.push(touching[i]);
            }
        }
        return results;
    }

    // public methods
    return {
        add_new_country : function(name, connected_to_array){
            var new_country = country(name, connected_to_array);
            new_country.set_state(undefined, 0);
            countries.push(new_country);
            return new_country;
        },
        toString : function(){
            return name;
        },
        get_ascii : function(){
            var s = this.name;
            s = s + '\n countries:';
            for (i in this.countries){
                s = s + '\n  ' + this.countries[i].toString();
            }
            return s;
        },
        attempt_move : function(player, move, args)

    };
};

document.writeln();

var north_america = map('North America');

document.writeln('adding '+north_america.add_new_country('canada', ['usa']));
document.writeln('adding '+north_america.add_new_country('usa', ['canada', 'mexico']));
document.writeln('adding '+north_america.add_new_country('mexico', ['usa']));

document.writeln(north_america);
document.writeln('this should be pretty:')
document.writeln(north_america.get_ascii());
north_america.countries[0].set_state('tom', 4);
north_america.countries[1].set_state('ryan', 6);
north_america.countries[2].set_state('tom', 4);

document.writeln(north_america.get_ascii());
document.writeln(north_america.countries[0].jsonify());

document.writeln('finished');
