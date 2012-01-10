// Risk in javascript
// First project in javascript
// planning for a client/server architecture
//


// This shouldn't actually be private! The closure is costing
// us tons of memory I imagine? Country is really just a
// convenience object for storing data, shouldn't every be used
// by anything other than game
var country = function(name, connected_to){
    // variables in constructor signature are private

    // These are private variables that weren't in the constructor signature
    var helper = function(player, num_troops){

        // These are public methods
        return {
            'get_name' : function(){return name},
            'get_troops' : function(){return num_troops;},
            'get_owner' : function(){return player;},
            'get_touching_names' : function(){return connected_to},
            'is_owned_by' : function(in_player){return in_player == player},
            'is_touching' : function(to){
                if (!(typeof to === 'string')){
                    to = to.get_name();
                }
                for (var i = 0; i < connected_to.length; i++){
                    if (connected_to[i] === to){
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
            },
            'dejasonify' : function(j){
                name = j.name;
                player = j.player;
                num_troops = j.num_troops;
                connected_to = j.connected_to;
            }
        };
    };
    return helper(null, null)
};

var game = function(name, countries, players){
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
                            var gobat = get_countries_owned_by_and_touching(player, owned[i].get_name());
                            if (get_countries_owned_by_and_touching(player, owned[i].get_name()).length > 0){
                                to_suggest.push(owned[i].get_name());
                            }
                        }
                    }
                    return to_suggest;
                },
                function(player, from){
                    var results = [];
                    var gobat = get_countries_owned_by_and_touching(player, from);
                    for (var i = 0; i < gobat.length; i++){
                        results.push(gobat[i].get_name());
                    }
                    return results;

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
                from_c = get_country(from);
                to_c = get_country(to);
                if (!(from_c.is_owned_by(player) && to_c.is_owned_by(player))){return false;}
                if (how_many > from_c.get_troops() - 1){return false;}
                if (!(from_c.is_touching(to_c.get_name()))){return false;}
                from_c.set_state(player, from_c.get_troops() - how_many);
                to_c.set_state(player, to_c.get_troops() + how_many);
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
    var get_countries_owned_by_and_touching = function(player, country_name){
        var results = [];
        var country = get_country(country_name);
        var touching = country.get_touching_names();
        for (var i = 0; i < touching.length; i++){
            test_country = get_country(touching[i])
            if (test_country.is_owned_by(player)){
                results.push(test_country);
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
            var result = actions[arg_array[0]].action.apply(null, arg_array.slice(1));
            if (result){
                this.action_history.push(arg_array);
                document.writeln('current action history: ')
                    for (var i = 0; i < this.action_history.length; i++){
                        document.writeln('  '+this.action_history[i]);
                    }
                return true;
            } else {
                return false;
            }
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
        action_history : [],
        base_state_json : {},
        whose_turn : null,
        turn_phase : null,
        jsonify : function(){
            // todo: jsonify method
            j = {};
            j.action_history = this.action_history;
            j.base_state_json = this.base_state_json;
            j.whose_turn = this.whose_turn;
            j.turn_phase = this.turn_phase;
            j.name = name;
            j.players = players;
            j.countries = [];
            for (var i = 0; i < countries.length; i++){
                j.countries.push(countries[i].jsonify());
            }
            return j;
        },
        dejsonify : function(j){
            this.base_state_json = j
            this.move_history = j.move_history;
            name = j.name;
            countries = [];
            for (var x in j.countries){document.writeln('  '+x);}
            for (var i = 0; i < j.countries.length; i++){
                var c = country();
                c.dejasonify(j.countries[i]);
                countries.push(c);
            }
            players = j.players;
            this.whose_turn = j.whose_turn;
            this.turn_phase = j.turn_phase;
        },
    };
};

document.writeln();

var north_america = game('North America', [], ['tomb', 'ryan']);

north_america.add_new_country('canada', ['usa']);
north_america.add_new_country('usa', ['canada', 'mexico']);
north_america.add_new_country('mexico', ['usa']);

north_america.set_country_state('usa', 'tom', 8);
north_america.set_country_state('canada', 'ryan', 4);
north_america.set_country_state('mexico', 'tom', 6);

document.writeln(north_america.get_ascii());


var na = north_america;
var t = function(msg){document.writeln(msg)};

t(na.suggest_action([]));
t(na.suggest_action(['move']));
t(na.suggest_action(['move', 'tom']));
t(na.suggest_action(['move', 'tom', 'usa']));
t(na.suggest_action(['move', 'tom', 'usa', 'mexico']));
t(na.suggest_action(['move', 'tom', 'usa', 'mexico', 7]));

t(na.take_action(['move', 'tom', 'usa', 'mexico', 7]));

document.writeln(north_america.get_ascii());

document.writeln(JSON.stringify(na.jsonify()));

var reconstituted = game(null, [], []);
document.writeln(reconstituted);
reconstituted.dejsonify(na.jsonify());
document.writeln(reconstituted.get_ascii());
document.writeln(JSON.stringify(reconstituted.jsonify()));

document.writeln('finished');
