// Risk in javascript
// First project in javascript
// planning for a client/server architecture
//


// This shouldn't actually be private! The closure is costing
// us tons of memory I imagine? Country is really just a
// convenience object for storing data, shouldn't every be used
// by anything other than map
var country = function(name, connected_to){

    // These are private variables that weren't in the constructor signature
    var helper = function(player, num_troops){

        // These are public methods
        return {
            'get_name' : function(){return name},
            'get_troops' : function(){return num_troops;},
            'get_owner' : function(){return player;},
            'get_touching' : function(){return connected_to},
            'is_owned_by' : function(in_player){return in_player == player},
            'is_touching' : function(to){
                for (var i = 0; i < connected_to.length; i++){
                    if (connected_to[i] == to){
                        return true;
                    }
                }
                return false;
            },

            'set_state' : function(in_player, in_num_troops){
                player = in_player;
                num_troops = in_num_troops;
            },
            'toString' : function(){
                return '[country '+name+']';
            },
            'get_ascii' : function(){
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
    return helper(null, null)
};

var map = function(name, countries, players){
    // private variables
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
                        if (owned[i].get_troops() > 1){
                            var gobat = get_countries_owned_by_and_touching(player, owned[i]);
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
                    var troops = get_country(from).get_troops();
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
                //todo: cache the countries; don't look for them on each line
                // todo: add if the move is allowed at this turn stage etc.
                if (!(get_country(from).is_owned_by(player) && get_country(to).is_owned_by(player))){return false;}
                if (how_many > get_country(from).get_troops() - 1){return false;}
                if (!(get_country(from).is_touching(to))){return false;}
                get_country(from).set_state(player, get_country(from).get_troops() - how_many);
                get_country(to).set_state(player, get_country(to).get_troops() + how_many);
                return true;
            }
        }
    };

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
        var touching = get_country(country).get_touching();
        for (var i = 0; i < touching.length; i++){
            if (get_country(touching[i]).is_owned_by(player)){
                results.push(get_country(touching[i]));
            }
        }
        return results;
    }
    var get_country = function(country){
        for (c in countries){
            if (countries[c].get_name() == country){
                return countries[c];
            }
        }
        return undefined;
    }

    // public methods
    return {
        suggest_action : function(arg_array){
            var to_suggest = [];
            if (arg_array === undefined || arg_array.length == 0){
                for (action in actions){
                    if (actions[action].should_be_suggested()){
                        to_suggest.push(action);
                    }
                }
                return to_suggest;
            } else if (arg_array.length > 0 ){
                action = arg_array[0];
                if (actions[action].arg_suggest_functions.length < arg_array.length){
                    return true;
                };
                return actions[action].arg_suggest_functions[arg_array.length-1].apply(null, arg_array.slice(1));
            } else {
                throw {name: 'Logic Error', message: 'neg length?'};
            }
        },
        take_action : function(arg_array){
            if (arg_array.length < 1){return false;}
            return actions[arg_array[0]].action.apply(null, arg_array.slice(1));
        },
        add_new_country : function(name, connected_to_array){
            var new_country = country(name, connected_to_array);
            new_country.set_state(null, 0);
            countries.push(new_country);
        },
        set_country_state : function(name, player, num_troops){
            c = get_country(name);
            if (c === undefined){return false;}
            return c.set_state(player, num_troops);
        },
        toString : function(){
            return name;
        },
        get_ascii : function(){
            var s = name;
            s = s + '\n countries:';
            for (var i = 0; i < countries.length; i++){
                s = s + '\n  ' + countries[i].get_ascii();
            }
            return s;
        },
    };
};

document.writeln();

var north_america = map('North America', [], ['tomb', 'ryan']);

north_america.add_new_country('canada', ['usa']);
north_america.add_new_country('usa', ['canada', 'mexico']);
north_america.add_new_country('mexico', ['usa']);

north_america.set_country_state('usa', 'tom', 8);
north_america.set_country_state('canada', 'ryan', 4);
north_america.set_country_state('mexico', 'tom', 6);

document.writeln(north_america.get_ascii());


var na = north_america;
var t = function(msg){document.writeln(msg)};

//t(na.suggest_action([]));
//t(na.suggest_action(['move']));
//t(na.suggest_action(['move', 'tom']));
//t(na.suggest_action(['move', 'tom', 'usa']));
//t(na.suggest_action(['move', 'tom', 'usa', 'mexico']));
//t(na.suggest_action(['move', 'tom', 'usa', 'mexico', 7]));

t(na.take_action(['move', 'tom', 'usa', 'mexico', 7]));

document.writeln(north_america.get_ascii());


document.writeln('finished');
